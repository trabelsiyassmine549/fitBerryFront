import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import { Article } from '../../models/article.model';
import { Commentaire } from '../../models/commentaire.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationModalComponent],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent implements OnInit {

  articles: Article[] = [];
  nutritionnisteIdFromUrl: number | null = null;
  pageTitle = "List of Articles";

  // User info from backend
  currentUserName: string = '';
  currentUserInitials: string = '';

  // Modal state
  showModal = false;
  isEditMode = false;
  isSubmitting = false;
  isUploadingImage = false;
  currentArticle: Article = this.getEmptyArticle();

  // Image handling
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Comments state
  selectedArticleId: number | null = null;
  commentaires: Commentaire[] = [];
  isLoadingComments = false;

  constructor(
    private articleService: ArticleService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load user info from AuthService
    const user = this.authService.currentUser();
    if (user) {
      this.currentUserName = `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email;
      const firstName = user.prenom || user.email.charAt(0).toUpperCase();
      const lastName = user.nom || '';
      this.currentUserInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    // Detect nutritionist ID in URL
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');

      if (idParam) {
        this.nutritionnisteIdFromUrl = +idParam;
        this.pageTitle = "Articles";
      } else {
        this.nutritionnisteIdFromUrl = null;
        this.pageTitle = "All Articles";
      }

      this.loadArticles();
    });
  }

  // Load articles (all or by nutritionist ID)
  loadArticles(): void {
    if (this.nutritionnisteIdFromUrl) {
      this.articleService.getAllByNutritionniste(this.nutritionnisteIdFromUrl).subscribe({
        next: (data: Article[]) => {
          console.log('Articles loaded:', data);
          this.articles = data;
        },
        error: (err: any) => console.error('Error loading articles:', err)
      });
    } else {
      this.articleService.getAll().subscribe({
        next: (data: Article[]) => {
          console.log('Articles loaded:', data);
          this.articles = data;
        },
        error: (err: any) => console.error('Error loading articles:', err)
      });
    }
  }

  // Modal functions
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentArticle = this.getEmptyArticle();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(article: Article): void {
    this.isEditMode = true;
    this.currentArticle = { ...article };
    this.selectedFile = null;
    this.imagePreview = article.imageURL ? this.getFullImageUrl(article.imageURL) : null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.currentArticle = this.getEmptyArticle();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // Handle image file selection
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;

      // Show preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.currentArticle.imageURL = '';
  }

  // Create or update an article
  submitArticle(): void {
    if (!this.currentArticle.titre || !this.currentArticle.description) {
      alert('Please fill in all required fields');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      alert('Error: User not authenticated');
      return;
    }

    this.isSubmitting = true;

    // Upload image first if needed
    if (this.selectedFile) {
      this.isUploadingImage = true;
      this.articleService.uploadImage(this.selectedFile).subscribe({
        next: (response: any) => {
          console.log('Image uploaded successfully:', response);
          this.currentArticle.imageURL = response.imageUrl;
          this.isUploadingImage = false;
          this.saveArticle(userId);
        },
        error: (err: any) => {
          console.error('Error uploading image:', err);
          alert('Error uploading image');
          this.isSubmitting = false;
          this.isUploadingImage = false;
        }
      });
    } else {
      if (!this.currentArticle.imageURL) {
        this.currentArticle.imageURL = '';
      }
      this.saveArticle(userId);
    }
  }

  private saveArticle(userId: number): void {
    if (this.isEditMode && this.currentArticle.id) {
      // Update the article
      this.articleService.update(this.currentArticle.id, this.currentArticle, userId).subscribe({
        next: () => {
          console.log('Article updated successfully');
          this.loadArticles();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err: any) => {
          console.error('Error updating article:', err);
          alert("Error: You may not have permission to update this article.");
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new article
      this.articleService.create(this.currentArticle, userId).subscribe({
        next: () => {
          console.log('Article created successfully');
          this.loadArticles();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err: any) => {
          console.error('Error creating article:', err);
          alert("Error: Unable to create article.");
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteArticle(id: number): void {
    if (confirm('Are you sure you want to delete this article?')) {
      const userId = this.authService.getUserId();
      if (!userId) {
        alert('Error: User not authenticated');
        return;
      }

      this.articleService.delete(id, userId).subscribe({
        next: () => {
          console.log('Article deleted successfully');
          this.loadArticles();
        },
        error: (err: any) => {
          console.error('Error deleting article:', err);
          alert("Error: You may not have permission to delete this article.");
        }
      });
    }
  }

  // Comments
  viewComments(articleId: number): void {
    this.selectedArticleId = articleId;
    this.isLoadingComments = true;

    this.articleService.getCommentaires(articleId).subscribe({
      next: (data) => {
        this.commentaires = data;
        this.isLoadingComments = false;
        console.log('Comments loaded:', data);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.isLoadingComments = false;
      }
    });
  }

  closeComments(): void {
    this.selectedArticleId = null;
    this.commentaires = [];
  }

  // Logout
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  // Helpers
  private getEmptyArticle(): Article {
    return {
      titre: '',
      description: '',
      imageURL: ''
    };
  }

  handleImageError(event: any): void {
    event.target.src =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23ffe5e5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23cc0000"%3EImage Not Available%3C/text%3E%3C/svg%3E';
  }

  getImageUrl(imageURL: string | undefined): string {
    if (!imageURL || imageURL.trim() === '') {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
    }
    return this.getFullImageUrl(imageURL);
  }

  private getFullImageUrl(imagePath: string): string {
    // If already a full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return imagePath;
  }
}
