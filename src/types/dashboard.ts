import React from 'react';

export interface DashboardConfig {
  sidebarContent: SidebarItem[];
  permissions: Permission[];
  headerConfig: HeaderConfig;
}

export interface SidebarItem {
  label: string;
  path: string;
  icon: React.ComponentType;
  badge?: number;
  children?: SidebarItem[];
}

export interface HeaderConfig {
  showNotifications: boolean;
  showUserMenu: boolean;
  showQuickActions: boolean;
  quickActions?: QuickAction[];
}

export interface QuickAction {
  label: string;
  icon: React.ComponentType;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

export type Permission = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'analytics' 
  | 'admin' 
  | 'system' 
  | 'book' 
  | 'message' 
  | 'manage';

export type UserRole = 'owner' | 'tenant' | 'manager' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  phone?: string;
}
