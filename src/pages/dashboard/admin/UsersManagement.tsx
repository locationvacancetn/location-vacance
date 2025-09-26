import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Shield,
  Building,
  Megaphone,
  Home,
  Phone,
  Mail,
  Calendar,
  Filter,
  Trash2,
  HomeIcon,
  MegaphoneIcon,
  X,
  UserPlus
} from "lucide-react";
import { useState, useEffect } from 'react';
import { useUsersManagement } from '@/hooks/useUsersManagement';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';

const UsersManagement = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { title, description } = usePageTitle();
  const {
    users,
    loading,
    searchTerm,
    roleFilter,
    stats,
    setSearchTerm,
    setRoleFilter,
    toggleUserStatus,
    deleteUser
  } = useUsersManagement();


  // Fonctions utilitaires
  const getRoleIcon = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN: return <Shield className="h-4 w-4" />;
      case USER_ROLES.OWNER: return <Building className="h-4 w-4" />;
      case USER_ROLES.ADVERTISER: return <Megaphone className="h-4 w-4" />;
      case USER_ROLES.TENANT: return <Home className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN: return 'destructive';
      case USER_ROLES.OWNER: return 'default';
      case USER_ROLES.ADVERTISER: return 'secondary';
      case USER_ROLES.TENANT: return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN: return 'Administrateur';
      case USER_ROLES.OWNER: return 'Propriétaire';
      case USER_ROLES.ADVERTISER: return 'Publicitaire';
      case USER_ROLES.TENANT: return 'Locataire';
      default: return role;
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-foreground">Chargement des utilisateurs...</p>
          <p className="text-sm text-muted-foreground">Veuillez patienter pendant que nous récupérons les données.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propriétaires</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.owners}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.owners / stats.total) * 100).toFixed(1) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicitaires</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.advertisers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.advertisers / stats.total) * 100).toFixed(1) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locataires</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.tenants}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.tenants / stats.total) * 100).toFixed(1) : 0}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et bouton d'ajout */}
      <div className="space-y-4">
        {/* Barre de recherche et bouton d'ajout sur la même ligne */}
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 placeholder:text-sm placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Button 
            onClick={() => navigate('/dashboard/admin/add-user')}
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>

        {/* Filtre par rôle */}
        <div className="max-w-md">
          <Select value={roleFilter} onValueChange={(value: string) => setRoleFilter(value)}>
            <SelectTrigger className="w-full">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrer par rôle" className="text-sm text-muted-foreground" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value={USER_ROLES.ADMIN}>Administrateur</SelectItem>
              <SelectItem value={USER_ROLES.OWNER}>Propriétaire</SelectItem>
              <SelectItem value={USER_ROLES.TENANT}>Locataire</SelectItem>
              <SelectItem value={USER_ROLES.ADVERTISER}>Publicitaire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistiques des résultats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {users.length} utilisateur{users.length !== 1 ? 's' : ''} 
            {searchTerm && ` trouvé${users.length !== 1 ? 's' : ''}`}
            {roleFilter !== "all" && ` (${getRoleLabel(roleFilter)}s)`}
          </span>
          {(searchTerm || roleFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
              }}
              className="h-6 text-xs"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {users.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center space-y-2">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== 'all' 
                ? 'Aucun utilisateur ne correspond aux critères de recherche.' 
                : 'Aucun utilisateur trouvé.'
              }
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Version desktop - Table complète avec Card */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Activité</TableHead>
                        <TableHead>Dernière connexion</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback>
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.full_name || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                              {getRoleIcon(user.role)}
                              {getRoleLabel(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              {user.role === USER_ROLES.OWNER && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <HomeIcon className="h-4 w-4" />
                                  <span className="font-medium">{user.properties_count || 0}</span>
                                  <span className="text-muted-foreground">annonce{user.properties_count !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                              {user.role === USER_ROLES.ADVERTISER && (
                                <div className="flex items-center gap-1 text-purple-600">
                                  <MegaphoneIcon className="h-4 w-4" />
                                  <span className="font-medium">{user.advertisements_count || 0}</span>
                                  <span className="text-muted-foreground">publicité{(user.advertisements_count || 0) !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                              {(user.role === USER_ROLES.TENANT || user.role === USER_ROLES.ADMIN) && (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(user.last_sign_in_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {user.phone ? (
                                <>
                                  <Phone className="h-3 w-3" />
                                  <a 
                                    href={`tel:${user.phone}`}
                                    className="hover:underline cursor-pointer"
                                    title={`Appeler ${user.phone}`}
                                  >
                                    {user.phone}
                                  </a>
                                </>
                              ) : (
                                <span>N/A</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? 'default' : 'destructive'}>
                              {user.is_active ? 'Actif' : 'Désactivé'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              {!user.is_active ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      className="h-8 w-8 p-0 text-white hover:opacity-90 transition-opacity"
                                      style={{ backgroundColor: 'rgb(30 174 90)' }}
                                      title="Réactiver le compte"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Réactiver le compte ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir réactiver ce compte ?
                                      L'utilisateur pourra à nouveau se connecter à la plateforme.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => toggleUserStatus(user.user_id, true)}
                                        className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                                      >
                                        Réactiver
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                // Ne pas afficher le bouton de désactivation pour les administrateurs
                                user.role !== USER_ROLES.ADMIN && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        className="h-8 w-8 p-0 text-white hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: '#d2ac21' }}
                                        title="Désactiver le compte"
                                      >
                                        <UserX className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                      <AlertDialogTitle>Désactiver le compte ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir désactiver ce compte ?
                                        L'utilisateur ne pourra plus se connecter à la plateforme.
                                      </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => toggleUserStatus(user.user_id, false)}
                                          className="bg-[#d2ac21] hover:bg-[#b8941f] text-white"
                                        >
                                          Désactiver
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )
                              )}
                              
                              {/* Bouton de suppression - seulement si ce n'est pas un admin et pas l'utilisateur actuel */}
                              {user.role !== USER_ROLES.ADMIN && user.user_id !== currentUser?.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      className="h-8 w-8 p-0 text-white hover:opacity-90 transition-opacity"
                                      style={{ backgroundColor: '#bc2d2b' }}
                                      title="Supprimer l'utilisateur"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer le compte de <strong>{user.full_name || user.email}</strong> ? 
                                        <br />
                                        Cette action est irréversible.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteUser(user.user_id)}
                                        className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Version mobile - Cards */}
          <div className="lg:hidden space-y-4">
            {users.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg bg-card">
                <div className="space-y-3">
                  {/* En-tête avec avatar, nom, email et statut */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-sm">{user.full_name || 'N/A'}</h3>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={user.is_active ? 'default' : 'destructive'}>
                      {user.is_active ? 'Actif' : 'Désactivé'}
                    </Badge>
                  </div>

                  {/* Rôle et activité sur la même ligne */}
                  <div className="flex items-center justify-between">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </Badge>
                    
                    {/* Activité */}
                    <div className="flex items-center gap-1 text-sm">
                      {user.role === USER_ROLES.OWNER && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <HomeIcon className="h-4 w-4" />
                          <span className="font-medium">{user.properties_count || 0}</span>
                          <span className="text-muted-foreground">annonce{user.properties_count !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {user.role === USER_ROLES.ADVERTISER && (
                        <div className="flex items-center gap-1 text-purple-600">
                          <MegaphoneIcon className="h-4 w-4" />
                          <span className="font-medium">{user.advertisements_count || 0}</span>
                          <span className="text-muted-foreground">publicité{(user.advertisements_count || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {(user.role === USER_ROLES.TENANT || user.role === USER_ROLES.ADMIN) && (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </div>
                  </div>

                  {/* Dernière connexion sur sa propre ligne */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Calendar className="h-3 w-3" />
                    <span>Dernière connexion: {formatDate(user.last_sign_in_at)}</span>
                  </div>

                  {/* Séparateur */}
                  <div className="border-t border-gray-200"></div>

                  {/* Actions et contact */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Actions */}
                      {!user.is_active ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="h-8 w-8 p-0 text-white hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: 'rgb(30 174 90)' }}
                              title="Réactiver le compte"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Réactiver le compte ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir réactiver ce compte ?
                              L'utilisateur pourra à nouveau se connecter à la plateforme.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => toggleUserStatus(user.user_id, true)}
                                className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                              >
                                Réactiver
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        // Ne pas afficher le bouton de désactivation pour les administrateurs
                        user.role !== USER_ROLES.ADMIN && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="h-8 w-8 p-0 text-white hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: '#d2ac21' }}
                                title="Désactiver le compte"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>Désactiver le compte ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir désactiver ce compte ?
                                L'utilisateur ne pourra plus se connecter à la plateforme.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => toggleUserStatus(user.user_id, false)}
                                  className="bg-[#d2ac21] hover:bg-[#b8941f] text-white"
                                >
                                  Désactiver
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )
                      )}
                      
                      {/* Bouton de suppression - seulement si ce n'est pas un admin et pas l'utilisateur actuel */}
                      {user.role !== USER_ROLES.ADMIN && user.user_id !== currentUser?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="h-8 w-8 p-0 text-white hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: '#bc2d2b' }}
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer le compte de <strong>{user.full_name || user.email}</strong> ? 
                                <br />
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUser(user.user_id)}
                                className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    
                    {/* Contact */}
                    {user.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`tel:${user.phone}`}
                          className="hover:underline cursor-pointer text-sm"
                          title={`Appeler ${user.phone}`}
                        >
                          {user.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UsersManagement;