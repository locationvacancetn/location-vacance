import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export default function TestProfile() {
  console.log('TestProfile - Component rendered');
  console.log('TestProfile - This should appear in console');
  
  const { user } = useAuth();
  const { userProfile, userRole, loading, error } = useUserRole();
  
  console.log('TestProfile - user:', user);
  console.log('TestProfile - userProfile:', userProfile);
  console.log('TestProfile - userRole:', userRole);
  console.log('TestProfile - loading:', loading);
  console.log('TestProfile - error:', error);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Profile Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Auth User:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="font-semibold">User Profile:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(userProfile, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="font-semibold">User Role:</h2>
          <p>{userRole || 'null'}</p>
        </div>
        
        <div>
          <h2 className="font-semibold">Loading:</h2>
          <p>{loading ? 'true' : 'false'}</p>
        </div>
        
        <div>
          <h2 className="font-semibold">Error:</h2>
          <p>{error || 'null'}</p>
        </div>
      </div>
    </div>
  );
}
