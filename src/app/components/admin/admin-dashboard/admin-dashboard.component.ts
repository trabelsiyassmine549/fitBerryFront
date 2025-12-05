import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import {
  User,
  Client,
  Nutritionniste,
  Article,
  Commentaire,
  StatCard,
  Role,
  DashboardStats,
  UserDisplay
} from '../../../models/admin.model';

import { UserFormComponent } from '../client-form-admin/client-form-admin.component';
import { ArticleFormComponent } from '../article-form-admin/article-form-admin.component';
import { NotificationModalComponent } from "../../notification-modal/notification-modal.component";

type TabType = 'stats' | 'users' | 'articles' | 'commentaires' | 'edit-user' | 'edit-article' | 'create-user';

type ArticleDisplay = Article & { auteurPrenom?: string; auteurNom?: string; };
type CommentaireDisplay = Commentaire & {
  utilisateurNom?: string;
  articleTitre?: string;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    UserFormComponent,
    ArticleFormComponent,
    NotificationModalComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  Math = Math;

  activeTab = signal<TabType>('stats');
  searchTerm = signal('');
  sidebarOpen = signal(true);
  showNotification = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  editingItem = signal<UserDisplay | Article | null>(null);

  private _articles = signal<ArticleDisplay[]>([]);
  private _commentaires = signal<CommentaireDisplay[]>([]);

  users = computed(() => this.adminService.users() as UserDisplay[]);
  loading = computed(() => this.adminService.loading());
  error = computed(() => this.adminService.error());

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const users = this.users().filter(u => u.role !== Role.ADMIN);
    if (!term) return users;

    return users.filter(user => {
      const client = user as Client;
      const nutritionniste = user as Nutritionniste;

      return (user.email || '').toLowerCase().includes(term) ||
             (client.prenom || nutritionniste.prenom || '').toLowerCase().includes(term) ||
             (client.nom || nutritionniste.nom || '').toLowerCase().includes(term) ||
             (user.role || '').toLowerCase().includes(term);
    });
  });

  articles = computed(() => this._articles());
  filteredArticles = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this._articles();
    return this._articles().filter(article =>
      (article.titre || '').toLowerCase().includes(term) ||
      (article.description || '').toLowerCase().includes(term) ||
      (article.auteurEmail || '').toLowerCase().includes(term) ||
      (article.auteurPrenom || '').toLowerCase().includes(term) ||
      (article.auteurNom || '').toLowerCase().includes(term)
    );
  });

  commentaires = computed(() => this._commentaires());

  statsCards = computed<StatCard[]>(() => {
    const stats = this.getStats();
    return [
      {
        title: 'Total Users',
        value: stats.totalUsers,
        icon: 'users',
        color: '#CCB1F6',
        subtitle: 'Active accounts'
      },
      {
        title: 'Nutritionists',
        value: stats.totalNutritionistes,
        icon: 'user-check',
        color: '#CDE26D',
        subtitle: 'Professional experts'
      },
      {
        title: 'Articles',
        value: stats.totalArticles,
        icon: 'file-text',
        color: '#F47552',
        subtitle: 'Published content'
      },
      {
        title: 'Comments',
        value: stats.totalCommentaires,
        icon: 'message-square',
        color: '#a872b2',
        subtitle: 'User engagement'
      }
    ];
  });

  chartData = computed(() => {
    const s = this.getStats();
    const total = s.totalClients + s.totalNutritionistes + s.totalArticles + s.totalCommentaires;
    if (total === 0) return [];

    return [
      { label: 'Clients', value: s.totalClients, color: '#CCB1F6', percentage: (s.totalClients / total * 100).toFixed(1) },
      { label: 'Nutritionists', value: s.totalNutritionistes, color: '#CDE26D', percentage: (s.totalNutritionistes / total * 100).toFixed(1) },
      { label: 'Articles', value: s.totalArticles, color: '#F47552', percentage: (s.totalArticles / total * 100).toFixed(1) },
      { label: 'Comments', value: s.totalCommentaires, color: '#97889a', percentage: (s.totalCommentaires / total * 100).toFixed(1) }
    ];
  });

  constructor() {
    effect(() => {
      const n = this.showNotification();
      if (n) setTimeout(() => this.showNotification.set(null), 3000);
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.startDataPolling();
  }

  loadInitialData(): void {
    this.loadUsers();
    this.loadArticles();
    this.loadComments();
  }

  loadUsers(): void {
    this.adminService.loadAllUsers().subscribe({
      next: () => {},
      error: (error) => console.error('Error loading users:', error)
    });
  }

  loadArticles(): void {
    this.adminService.adminGetAllArticles().subscribe({
      next: (articles) => {
        this._articles.set(articles.map(a => ({
          ...a,
          auteurPrenom: a.auteurPrenom || '',
          auteurNom: a.auteurNom || ''
        })));
      },
      error: (error) => console.error('Error loading articles:', error)
    });
  }

  loadComments(): void {
    this.adminService.adminGetAllCommentaires().subscribe({
      next: (comments) => {
        this._commentaires.set(comments.map(c => ({
          ...c,
          utilisateurNom: c.utilisateurNom || 'Unknown'
        })));
      },
      error: (error) => console.error('Error loading comments:', error)
    });
  }

  startDataPolling(): void {
    setInterval(() => {
      this.loadComments();
      this.loadArticles();
    }, 30000);
  }

  setTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.searchTerm.set('');
    this.editingItem.set(null);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe({
        next: () => {},
        error: (error) => {
          console.error('Logout error:', error);
          this.showNotification.set({ type: 'error', message: 'Error logging out' });
        }
      });
    }
  }

  createUser(): void {
    this.editingItem.set({
      prenom: '',
      nom: '',
      email: '',
      motDePasse: '',
      role: Role.CLIENT
    } as UserDisplay & { motDePasse: string });
    this.activeTab.set('create-user');
  }

  createArticle(): void {
    this.editingItem.set({
      titre: '',
      description: '',
      imageURL: ''
    } as Article);
    this.activeTab.set('edit-article');
  }

  navigateToEdit(type: 'user' | 'article', id: number): void {
    let item: any = null;

    if (type === 'user') {
      item = this.adminService.getUserByIdLocal(id);

      if (item && item.role === Role.ADMIN) {
        this.showNotification.set({ type: 'error', message: 'Cannot edit admin users' });
        return;
      }

      if (item) {
        this.editingItem.set(item);
        this.activeTab.set('edit-user');
      }
    } else {
      item = this._articles().find(a => a.id === id);
      if (item) {
        this.editingItem.set(item);
        this.activeTab.set('edit-article');
      }
    }
  }

  deleteItem(type: 'user' | 'article', item: any): void {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    if (type === 'user') {
      if (item.role === Role.ADMIN) {
        this.showNotification.set({ type: 'error', message: 'Cannot delete admin users' });
        return;
      }

      this.adminService.deleteUser(item.id).subscribe({
        next: () => {
          this.showNotification.set({ type: 'success', message: 'User deleted successfully' });
          this.loadUsers();
        },
        error: () => this.showNotification.set({ type: 'error', message: 'Error deleting user' })
      });
    } else {
      this.adminService.adminDeleteArticle(item.id).subscribe({
        next: () => {
          this._articles.update(a => a.filter(x => x.id !== item.id));
          this.showNotification.set({ type: 'success', message: 'Article deleted successfully' });
        },
        error: () => this.showNotification.set({ type: 'error', message: 'Error deleting article' })
      });
    }
  }

  deleteCommentaire(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.adminService.adminDeleteCommentaire(commentId).subscribe({
      next: () => {
        this._commentaires.update(c => c.filter(x => x.id !== commentId));
        this.showNotification.set({ type: 'success', message: 'Comment deleted successfully' });
      },
      error: () => this.showNotification.set({ type: 'error', message: 'Error deleting comment' })
    });
  }

  onFormSubmit(type: 'user' | 'article'): void {
    this.showNotification.set({
      type: 'success',
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully`
    });

    if (type === 'user') {
      this.loadUsers();
    } else {
      this.loadArticles();
    }

    setTimeout(() => {
      this.activeTab.set(type === 'user' ? 'users' : 'articles');
      this.editingItem.set(null);
    }, 1500);
  }

  onFormCancel(type: 'user' | 'article'): void {
    this.activeTab.set(type === 'user' ? 'users' : 'articles');
    this.editingItem.set(null);
  }

  getStats(): DashboardStats {
    const users = this.adminService.users();

    return {
      totalUsers: users.length,
      totalNutritionistes: users.filter(u => u.role === Role.NUTRITIONNISTE).length,
      totalArticles: this._articles().length,
      totalClients: users.filter(u => u.role === Role.CLIENT).length,
      totalCommentaires: this._commentaires().length,
      newUsersThisMonth: 0,
      articlesThisMonth: 0
    };
  }

  getCommentaires(): CommentaireDisplay[] {
    return this._commentaires();
  }

  getArticleTitle(articleId: number): string {
    if (!articleId) return 'Unknown Article';
    const a = this._articles().find(x => x.id === articleId);
    return a ? a.titre : 'Unknown Article';
  }

  formatDate(date?: Date): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('en-US');
    } catch {
      return '-';
    }
  }

  getRoleLabel(role: Role): string {
    switch (role) {
      case Role.CLIENT: return 'Client';
      case Role.NUTRITIONNISTE: return 'Nutritionist';
      case Role.ADMIN: return 'Admin';
      default: return 'Unknown';
    }
  }

  getUserDisplayName(user: UserDisplay): string {
    const client = user as Client;
    const nutritionniste = user as Nutritionniste;

    const prenom = client.prenom || nutritionniste.prenom || '';
    const nom = client.nom || nutritionniste.nom || '';

    return `${prenom} ${nom}`.trim() || 'N/A';
  }

  getEditingUser(): UserDisplay | null {
    const item = this.editingItem();
    if (!item) return null;
    if ('email' in item && 'role' in item && !('titre' in item)) {
      return item as UserDisplay;
    }
    return null;
  }

  getEditingArticle(): Article | null {
    const item = this.editingItem();
    if (!item) return null;
    if ('titre' in item && 'description' in item) {
      return item as Article;
    }
    return null;
  }

  getRotation(index: number): number {
    let rotation = -90;
    const data = this.chartData();
    for (let i = 0; i < index; i++) {
      rotation += parseFloat(data[i].percentage) * 3.6;
    }
    return rotation;
  }

  getIconSvg(iconName: string): string {
    const icons: { [key: string]: string } = {
      'users': 'M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z',
      'user-check': 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M15.9 8.1C17.7 8.1 19.2 9.6 19.2 11.4V14H17V22H7V14H4.8V11.4C4.8 9.6 6.3 8.1 8.1 8.1H15.9Z',
      'file-text': 'M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z',
      'message-square': 'M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z'
    };
    return icons[iconName] || icons['users'];
  }
}
