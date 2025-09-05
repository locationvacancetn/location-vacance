export default function SimpleTest() {
  console.log('SimpleTest - Component rendered');
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Simple</h1>
      <p>Si vous voyez ce message, le routage fonctionne !</p>
      <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700">✅ Le composant SimpleTest s'affiche correctement</p>
      </div>
    </div>
  );
}
