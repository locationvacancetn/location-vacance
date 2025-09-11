/**
 * Composant de test pour la compression d'images
 * Permet de tester la compression avec différentes tailles d'images
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  compressImage, 
  formatFileSize, 
  CompressionResult, 
  CompressionProgress 
} from "@/utils/imageCompression";
import { Upload, Download, Trash2 } from "lucide-react";

const ImageCompressionTest = () => {
  const [testResults, setTestResults] = useState<CompressionResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<CompressionProgress | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setProgress(null);

    try {
      const results: CompressionResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setProgress({
          current: i + 1,
          total: files.length,
          currentFileName: file.name,
          isComplete: false,
        });

        const result = await compressImage(file);
        results.push(result);
      }

      setTestResults(prev => [...prev, ...results]);
    } catch (error) {
      console.error('Erreur lors du test de compression:', error);
    } finally {
      setIsCompressing(false);
      setProgress(null);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const downloadCompressed = (result: CompressionResult) => {
    const url = URL.createObjectURL(result.compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${result.compressedFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalOriginalSize = testResults.reduce((sum, result) => sum + result.originalSize, 0);
  const totalCompressedSize = testResults.reduce((sum, result) => sum + result.compressedSize, 0);
  const totalSavings = totalOriginalSize - totalCompressedSize;
  const averageCompressionRatio = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, result) => sum + result.compressionRatio, 0) / testResults.length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test de Compression d'Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="test-file-input"
            />
            <label htmlFor="test-file-input">
              <Button asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Sélectionner des images
                </span>
              </Button>
            </label>
            
            {testResults.length > 0 && (
              <Button onClick={clearResults} variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer les résultats
              </Button>
            )}
          </div>

          {isCompressing && progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Compression en cours...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
              <p className="text-sm text-muted-foreground">{progress.currentFileName}</p>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatFileSize(totalOriginalSize)}
                </div>
                <div className="text-sm text-muted-foreground">Taille originale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatFileSize(totalCompressedSize)}
                </div>
                <div className="text-sm text-muted-foreground">Taille compressée</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  -{Math.round((totalSavings / totalOriginalSize) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Économie totale</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testResults.map((result, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(result.compressedFile)}
                      alt={`Test ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Original:</span>
                      <span>{formatFileSize(result.originalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Compressé:</span>
                      <span className="text-green-600">{formatFileSize(result.compressedSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Économie:</span>
                      <span className="text-blue-600">-{result.compressionRatio}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dimensions:</span>
                      <span>{result.width} × {result.height}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => downloadCompressed(result)}
                    size="sm"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCompressionTest;
