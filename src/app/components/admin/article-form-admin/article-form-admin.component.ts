import { Component, Input, Output, EventEmitter, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { Article, Role } from '../../../models/admin.model';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './article-form-admin.component.html',
  styleUrls: ['./article-form-admin.component.css']
})
export class ArticleFormComponent implements OnInit {
  private adminService = inject(AdminService);

  @Input() article: Article | null = null;
  @Input() isEditMode = false;
  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isSubmitting = signal(false);
  isUploadingImage = signal(false);
  pageTitle = signal('Create Article');
  showNotification = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  articleData = signal<Partial<Article>>({
    titre: '',
    description: '',
    imageURL: ''
  });

  isFormValid = computed(() => {
    const a = this.articleData();
    return (a.titre?.trim().length || 0) > 0 &&
           (a.description?.trim().length || 0) > 0;
  });

  constructor() {
    effect(() => {
      const n = this.showNotification();
      if (n) setTimeout(() => this.showNotification.set(null), 3000);
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.article) {
      this.pageTitle.set('Edit Article');
      this.articleData.set({ ...this.article });
    } else {
      this.pageTitle.set('Create Article');
    }
  }

  updateField(field: keyof Article, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = target.value;
    this.articleData.update(a => ({ ...a, [field]: value }));
  }

  onImageChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showNotification.set({ type: 'error', message: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification.set({ type: 'error', message: 'Image size must be less than 5MB' });
      return;
    }

    this.isUploadingImage.set(true);

    // Upload image to backend
    this.adminService.uploadImage(file).subscribe({
      next: (response: { imageUrl: string }) => {
        this.articleData.update(a => ({ ...a, imageURL: response.imageUrl }));
        this.showNotification.set({ type: 'success', message: 'Image uploaded successfully' });
        this.isUploadingImage.set(false);
      },
      error: (err: Error) => {
        console.error('Image upload error:', err);
        this.showNotification.set({ type: 'error', message: 'Failed to upload image' });
        this.isUploadingImage.set(false);
      }
    });
  }

  removeImage(): void {
    this.articleData.update(a => ({ ...a, imageURL: '' }));
    // Clear file input
    const fileInput = document.getElementById('imageUrl') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showNotification.set({ type: 'error', message: 'Missing or invalid fields' });
      return;
    }

    this.isSubmitting.set(true);
    const data = this.articleData();

    // Prepare payload according to backend CreateArticleRequest
    const payload = {
      titre: data.titre!.trim(),
      description: data.description!.trim(),
      imageURL: data.imageURL || null
    };

    if (this.isEditMode && data.id) {
      // Update article - use admin endpoint
      this.adminService.updateArticle(data.id, payload).subscribe({
        next: () => {
          this.showNotification.set({ type: 'success', message: 'Article updated successfully' });
          setTimeout(() => this.submit.emit(), 1000);
        },
        error: (err: Error) => {
          console.error('Update error:', err);
          const errorMsg = err.message || 'Error updating article';
          this.showNotification.set({ type: 'error', message: errorMsg });
        }
      }).add(() => this.isSubmitting.set(false));
    } else {
      // Create article - need a nutritionniste ID
      const users = this.adminService.users();
      const nutritionniste = users.find(u => u.role === Role.NUTRITIONNISTE);

      if (!nutritionniste || !nutritionniste.id) {
        this.showNotification.set({
          type: 'error',
          message: 'No nutritionist available. Please create a nutritionist user first.'
        });
        this.isSubmitting.set(false);
        return;
      }

      this.adminService.createArticle(payload, nutritionniste.id).subscribe({
        next: () => {
          this.showNotification.set({ type: 'success', message: 'Article created successfully' });
          setTimeout(() => this.submit.emit(), 1000);
        },
        error: (err: Error) => {
          console.error('Create error:', err);
          const errorMsg = err.message || 'Error creating article';
          this.showNotification.set({ type: 'error', message: errorMsg });
        }
      }).add(() => this.isSubmitting.set(false));
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
