import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.css']
})
export class ArticleFormComponent implements OnInit {

  article: Article;
  loggedInNutritionistId = 6; // Replace with actual logged-in user ID
  isSubmitting: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private articleService: ArticleService) {
    this.article = this.getEmptyArticle();
  }

  ngOnInit(): void {}

  // File handling
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Image size must not exceed 10MB');
        return;
      }

      this.selectedFile = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

    } else {
      alert('Please select a valid image (PNG, JPG, GIF)');
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.article.imageURL = '';
  }

  // Create article
  createArticle(): void {
    if (!this.article.titre || !this.article.description) {
      alert('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    this.articleService.createWithFile(
      this.article,
      this.selectedFile,
      this.loggedInNutritionistId
    ).subscribe({
      next: (response: Article) => {
        console.log('Article created successfully', response);
        alert('Article created successfully!');
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (err: any) => {
        console.error('Full error:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.error);
        alert(`Creation error: ${err.error?.message || err.message || "Unable to create article."}`);
        this.isSubmitting = false;
      }
    });
  }

  // Reset form after success
  private resetForm(): void {
    this.article = this.getEmptyArticle();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  private getEmptyArticle(): Article {
    return {
      titre: '',
      description: '',
      imageURL: ''
    };
  }
}
