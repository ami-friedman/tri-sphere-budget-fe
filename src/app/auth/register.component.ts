import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div class="w-full max-w-sm md:max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <h2 class="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-100">Create a New Account</h2>
        <form (ngSubmit)="onRegister()" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input type="text" id="username" name="username" [(ngModel)]="username"
                   class="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400" required>
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" id="email" name="email" [(ngModel)]="email"
                   class="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400" required>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" id="password" name="password" [(ngModel)]="password"
                   class="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400" required>
          </div>
          @if (errorMessage) {
            <div class="text-red-500 dark:text-red-400 text-sm font-semibold">
              {{ errorMessage }}
            </div>
          }
          <button type="submit"
                  class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
            Register
          </button>
        </form>
        <div class="text-center text-sm font-medium">
          <a routerLink="/login" class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Already have an account? Sign In
          </a>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  onRegister(): void {
    this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Registration failed. Please try again.';
      }
    });
  }
}
