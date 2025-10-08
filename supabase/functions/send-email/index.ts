import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders, getPreflightHeaders } from '../_shared/cors.ts'
import { validateEmail } from '../_shared/validation.ts'

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  isTest?: boolean;
}

// Simple SMTP client implementation
class SimpleSmtpClient {
  private conn: Deno.Conn | null = null;

  async connectTLS(config: {
    hostname: string;
    port: number;
    username: string;
    password: string;
  }) {
    try {
      // Create TLS connection directly (port 465 already uses SSL/TLS)
      this.conn = await Deno.connectTls({
        hostname: config.hostname,
        port: config.port,
      });

      // Read welcome message
      await this.readResponse();

      // Send EHLO
      await this.sendCommand(`EHLO ${config.hostname}`);

      // Authenticate directly (no STARTTLS needed on port 465)
      await this.sendCommand('AUTH LOGIN');
      await this.sendCommand(btoa(config.username));
      await this.sendCommand(btoa(config.password));

    } catch (error) {
      console.error('SMTP connection error:', error);
      throw new Error(`Erreur de connexion SMTP: ${error.message}`);
    }
  }

  async send(email: {
    from: string;
    to: string;
    subject: string;
    content: string;
    html?: string;
  }) {
    try {
      // Send MAIL FROM
      await this.sendCommand(`MAIL FROM:<${email.from}>`);

      // Send RCPT TO
      await this.sendCommand(`RCPT TO:<${email.to}>`);

      // Send DATA
      await this.sendCommand('DATA');

      // Send email headers and body
      const emailData = this.buildEmailData(email);
      await this.sendCommand(emailData);

      // End data
      await this.sendCommand('.');

    } catch (error) {
      console.error('SMTP send error:', error);
      throw new Error(`Erreur d'envoi d'email: ${error.message}`);
    }
  }

  async close() {
    if (this.conn) {
      try {
        await this.sendCommand('QUIT');
      } catch (error) {
        console.error('Error closing SMTP connection:', error);
      } finally {
        this.conn.close();
        this.conn = null;
      }
    }
  }

  private async sendCommand(command: string) {
    if (!this.conn) {
      throw new Error('No SMTP connection');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(command + '\r\n');
    await this.conn.write(data);
    
    return await this.readResponse();
  }

  private async readResponse() {
    if (!this.conn) {
      throw new Error('No SMTP connection');
    }

    const buffer = new Uint8Array(1024);
    const n = await this.conn.read(buffer);
    if (n === null) {
      throw new Error('Connection closed');
    }

    const decoder = new TextDecoder();
    const response = decoder.decode(buffer.subarray(0, n));
    
    // Check for error responses
    if (response.startsWith('5') || response.startsWith('4')) {
      throw new Error(`SMTP Error: ${response}`);
    }

    return response;
  }

  private buildEmailData(email: {
    from: string;
    to: string;
    subject: string;
    content: string;
    html?: string;
  }): string {
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let emailData = '';
    emailData += `From: ${email.from}\r\n`;
    emailData += `To: ${email.to}\r\n`;
    emailData += `Subject: ${email.subject}\r\n`;
    emailData += `MIME-Version: 1.0\r\n`;
    
    if (email.html) {
      emailData += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n`;
      emailData += `\r\n`;
      emailData += `--${boundary}\r\n`;
      emailData += `Content-Type: text/plain; charset=utf-8\r\n`;
      emailData += `\r\n`;
      emailData += `${email.content}\r\n`;
      emailData += `\r\n`;
      emailData += `--${boundary}\r\n`;
      emailData += `Content-Type: text/html; charset=utf-8\r\n`;
      emailData += `\r\n`;
      emailData += `${email.html}\r\n`;
      emailData += `\r\n`;
      emailData += `--${boundary}--\r\n`;
    } else {
      emailData += `Content-Type: text/plain; charset=utf-8\r\n`;
      emailData += `\r\n`;
      emailData += `${email.content}\r\n`;
    }

    return emailData;
  }
}

serve(async (req) => {
  // 🔒 SEC-006: Récupérer l'origine de la requête
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getPreflightHeaders(origin) })
  }

  try {
    // Get SMTP configuration from environment variables
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');

    // Validate required SMTP configuration
    if (!smtpHost || !smtpUser || !smtpPassword) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuration SMTP manquante',
          details: 'Les variables SMTP_HOST, SMTP_USER et SMTP_PASSWORD doivent être configurées dans les Secrets Supabase'
        }),
        { 
          status: 500, 
            headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const { to, subject, message, isTest = false }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          error: 'Les champs to, subject et message sont requis' 
        }),
        { 
          status: 400, 
            headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    // ✅ CODE-003 : Utilise la fonction centralisée de validation
    if (!validateEmail(to)) {
      return new Response(
        JSON.stringify({ 
          error: 'Format d\'email invalide' 
        }),
        { 
          status: 400, 
            headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
        }
      );
    }

    // Create SMTP client
    const client = new SimpleSmtpClient();

    // Configure SMTP connection
    await client.connectTLS({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUser,
      password: smtpPassword,
    });

    // Prepare email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border-radius: 8px; }
          .footer { margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666; }
          ${isTest ? '.test-badge { background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 10px; }' : ''}
        </style>
      </head>
      <body>
        <div class="container">
          ${isTest ? '<div class="test-badge">EMAIL DE TEST</div>' : ''}
          <div class="header">
            <h2>${subject}</h2>
          </div>
          <div class="content">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>Cet email a été envoyé depuis votre application Location Vacance</p>
            <p>Envoyé depuis ${smtpUser}</p>
            ${isTest ? '<p><strong>Ceci est un email de test pour vérifier la configuration SMTP.</strong></p>' : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await client.send({
      from: smtpUser,
      to: to,
      subject: subject,
      content: message,
      html: htmlContent,
    });

    // Close connection
    await client.close();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email envoyé avec succès',
        to,
        subject,
        isTest
      }),
      { 
        status: 200, 
            headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // Log error
    console.error('Erreur lors de l\'envoi d\'email:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors de l\'envoi de l\'email',
        details: error.toString()
      }),
      { 
        status: 500, 
            headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
      }
    );
  }
});
