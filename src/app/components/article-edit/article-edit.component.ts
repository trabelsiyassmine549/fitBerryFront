import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-edit.component.html',
})
export class ArticleEditComponent implements OnInit {

  loggedInNutritionistId = 6;
  article: Article | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const articleId = +idParam;
      this.articleService.getById(articleId).subscribe({
        next: (data) => {
          this.article = data;
        },
        error: (err) => {
          console.error("Error loading article", err);
          alert("Article not found.");
          this.router.navigate(['/articles']);
        }
      });
    } else {
      this.router.navigate(['/articles']);
    }
  }

  updateArticle(): void {
    if (this.article) {
      this.articleService.update(this.article.id!, this.article, this.loggedInNutritionistId).subscribe({
        next: () => {
          console.log('Article updated successfully');
          this.router.navigate(['/articles']);
        },
        error: (err) => {
          console.error('Error during update', err);
          alert("Error: You may not have permission to modify this article.");
        }
      });
    }
  }
}
