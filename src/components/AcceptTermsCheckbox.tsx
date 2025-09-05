import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

/**
 * AcceptTermsCheckbox
 * Composant réutilisable pour l'acceptation des CGU et Politique de confidentialité.
 * - Toujours coché (checked)
 * - Impossible à décocher (empêche l'action utilisateur)
 * - N'affiche pas d'icône ou style disabled
 * - Utilise le design system (tailwind.config.js)
 *
 * Exemple d'utilisation :
 * <AcceptTermsCheckbox />
 */
const AcceptTermsCheckbox: React.FC = () => {
  // Toujours true, impossible à décocher
  const checked = true;

  // Empêche la modification de l'état (décochage)
  const handlePreventUncheck = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-start space-x-2 select-none">
      <span
        // On intercepte tous les événements qui pourraient décocher
        onClick={handlePreventUncheck}
        onKeyDown={handlePreventUncheck}
        tabIndex={-1}
        className="mt-1"
      >
        <Checkbox id="terms" checked={checked} tabIndex={-1} />
      </span>
      <Label htmlFor="terms" className="text-sm text-muted-foreground leading-5 cursor-default">
        J'accepte les {" "}
        <Link to="/terms" className="text-primary hover:underline" tabIndex={-1}>
          Conditions d'utilisation
        </Link>{" "}
        et la {" "}
        <Link to="/privacy" className="text-primary hover:underline" tabIndex={-1}>
          Politique de confidentialité
        </Link>
      </Label>
    </div>
  );
};

export default AcceptTermsCheckbox;
