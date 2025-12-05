import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../../../services/article.service';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-article-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-section.component.html',
  styleUrls: ['./article-section.component.css']
})
export class ArticleSectionComponent implements OnInit {

  articles: any[] = [];
  selectedArticleId: number | null = null;
  commentaires: any[] = [];
  isLoadingArticles = false;
  isLoadingComments = false;
  isSubmittingComment = false;

  newComment = {
    titre: '',
    description: ''
  };


  constructor(
    private articleService: ArticleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoadingArticles = true;
    this.articleService.getAll().subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoadingArticles = false;
        console.log('Articles loaded:', data);
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        this.isLoadingArticles = false;
      }
    });
  }

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

  addComment(): void {
    if (!this.newComment.titre.trim() || !this.newComment.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    if (!this.selectedArticleId) {
      alert('Please select an article');
      return;
    }

    this.isSubmittingComment = true;

    this.articleService.addCommentaire(this.selectedArticleId, this.newComment)
      .subscribe({
        next: (response) => {
          console.log('Comment added successfully:', response);
          this.newComment.titre = '';
          this.newComment.description = '';
          this.viewComments(this.selectedArticleId!);
          this.isSubmittingComment = false;
        },
        error: (err) => {
          console.error('Error adding comment:', err);
          alert('Error adding comment. Please try again.');
          this.isSubmittingComment = false;
        }
      });
  }

  closeComments(): void {
    this.selectedArticleId = null;
    this.commentaires = [];
    this.newComment = {
      titre: '',
      description: ''
    };
  }

  getImageUrl(imageURL: string | undefined): string {
    if (!imageURL || imageURL.trim() === '') {
      // Use a data URL for placeholder instead of external service
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999"%3EPas d\'image%3C/text%3E%3C/svg%3E';
    }
    if (imageURL.startsWith('http')) {
      return imageURL;
    }
    // If it's a relative path from backend (e.g., /uploads/images/...)
    return imageURL;
  }

  handleImageError(event: any): void {
    // Use a data URL for error fallback
    event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23ffe5e5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23cc0000"%3EImage Non Disponible%3C/text%3E%3C/svg%3E';
  }

  goBackToProfile() {
  this.router.navigate(['client/:id/profile']);
}

}
