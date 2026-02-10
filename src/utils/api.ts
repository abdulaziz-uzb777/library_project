import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-58aa32b3`;

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  summary: string;
  category: string;
  pdfUrl?: string;
  coverImageUrl?: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  city: string;
  aboutMe: string;
  favorites: string[];
  recent: string[];
}

export interface Comment {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userLogin: string;
  text: string;
  createdAt: number;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
}

// ==================== AUTH API ====================

export async function signup(data: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  city: string;
  aboutMe: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  return response.json();
}

export async function signin(login: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ login, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Sign in failed');
  }

  return response.json();
}

export async function getCurrentUser(accessToken: string): Promise<{ user: UserProfile }> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Access-Token': accessToken,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Get current user error response:', text);
    console.error('Access token used:', accessToken);
    try {
      const error = JSON.parse(text);
      throw new Error(error.error || 'Failed to get user');
    } catch (e) {
      throw new Error(`Failed to get user: ${text}`);
    }
  }

  return response.json();
}

// ==================== ADMIN API ====================

export async function adminLogin(password: string) {
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Admin login failed');
  }

  return response.json();
}

export async function getUsers(adminToken: string) {
  const response = await fetch(`${API_BASE}/admin/users`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': adminToken,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Get users error response:', text);
    try {
      const error = JSON.parse(text);
      throw new Error(error.error || 'Failed to get users');
    } catch (e) {
      throw new Error(`Failed to get users: ${text}`);
    }
  }

  return response.json();
}

export async function addBook(adminToken: string, bookData: {
  title: string;
  author: string;
  description: string;
  summary: string;
  category: string;
  pdfFile?: File;
  coverImageFile?: File;
}) {
  const formData = new FormData();
  formData.append('title', bookData.title);
  formData.append('author', bookData.author);
  formData.append('description', bookData.description);
  formData.append('summary', bookData.summary);
  formData.append('category', bookData.category);
  
  if (bookData.pdfFile) {
    formData.append('pdfFile', bookData.pdfFile);
  }
  
  if (bookData.coverImageFile) {
    formData.append('coverImage', bookData.coverImageFile);
  }

  const response = await fetch(`${API_BASE}/admin/books`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': adminToken,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Add book error response:', text);
    try {
      const error = JSON.parse(text);
      throw new Error(error.error || 'Failed to add book');
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      if (text.includes('WORKER_LIMIT')) {
        throw new Error('Файлы слишком большие. Пожалуйста, уменьшите размер PDF или изображения.');
      }
      throw new Error(`Failed to add book: ${text.substring(0, 200)}`);
    }
  }

  return response.json();
}

export async function deleteBook(adminToken: string, bookId: string) {
  const response = await fetch(`${API_BASE}/admin/books/${bookId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': adminToken,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete book');
  }

  return response.json();
}

// ==================== BOOKS API ====================

export async function getBooks(): Promise<{ books: Book[] }> {
  const response = await fetch(`${API_BASE}/books`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error fetching books:', error);
    throw new Error(error.error || 'Failed to get books');
  }

  return response.json();
}

export async function getBook(bookId: string): Promise<{ book: Book }> {
  const response = await fetch(`${API_BASE}/books/${bookId}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get book');
  }

  return response.json();
}

// ==================== USER ACTIONS ====================

export async function addToFavorites(accessToken: string, bookId: string) {
  const response = await fetch(`${API_BASE}/user/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Access-Token': accessToken,
    },
    body: JSON.stringify({ bookId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add to favorites');
  }

  return response.json();
}

export async function removeFromFavorites(accessToken: string, bookId: string) {
  const response = await fetch(`${API_BASE}/user/favorites/${bookId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Access-Token': accessToken,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove from favorites');
  }

  return response.json();
}

export async function addToRecent(accessToken: string, bookId: string) {
  const response = await fetch(`${API_BASE}/user/recent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Access-Token': accessToken,
    },
    body: JSON.stringify({ bookId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add to recent');
  }

  return response.json();
}

// ==================== COMMENTS API ====================

export async function addComment(accessToken: string, bookId: string, text: string) {
  const response = await fetch(`${API_BASE}/books/${bookId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Access-Token': accessToken,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add comment');
  }

  return response.json();
}

export async function getComments(bookId: string): Promise<{ comments: Comment[] }> {
  const response = await fetch(`${API_BASE}/books/${bookId}/comments`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get comments');
  }

  return response.json();
}

export async function getAllComments(adminToken: string): Promise<{ comments: Comment[] }> {
  const response = await fetch(`${API_BASE}/admin/comments`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': adminToken,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get all comments');
  }

  return response.json();
}

export async function deleteComment(adminToken: string, commentId: string) {
  const response = await fetch(`${API_BASE}/admin/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': adminToken,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete comment');
  }

  return response.json();
}

// ==================== FEEDBACK API ====================

export async function submitFeedback(data: { name: string; email: string; message: string }) {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit feedback');
  }

  return response.json();
}

export async function getFeedback(adminToken: string): Promise<{ feedback: Feedback[] }> {
  const response = await fetch(`${API_BASE}/admin/feedback`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': adminToken,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get feedback');
  }

  return response.json();
}

export async function deleteFeedback(adminToken: string, feedbackId: string) {
  const response = await fetch(`${API_BASE}/admin/feedback/${feedbackId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': adminToken,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete feedback');
  }

  return response.json();
}

// ==================== UPDATE BOOK API ====================

export async function updateBook(adminToken: string, bookId: string, bookData: {
  title?: string;
  author?: string;
  description?: string;
  summary?: string;
  category?: string;
  pdfFile?: File;
  coverImageFile?: File;
}) {
  const formData = new FormData();
  
  if (bookData.title) formData.append('title', bookData.title);
  if (bookData.author) formData.append('author', bookData.author);
  if (bookData.description) formData.append('description', bookData.description);
  if (bookData.summary) formData.append('summary', bookData.summary);
  if (bookData.category) formData.append('category', bookData.category);
  if (bookData.pdfFile) formData.append('pdf', bookData.pdfFile);
  if (bookData.coverImageFile) formData.append('coverImage', bookData.coverImageFile);

  const response = await fetch(`${API_BASE}/admin/books/${bookId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Admin-Token': adminToken,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Update book error response:', text);
    try {
      const error = JSON.parse(text);
      throw new Error(error.error || 'Failed to update book');
    } catch (parseError) {
      throw new Error(`Failed to update book: ${text.substring(0, 200)}`);
    }
  }

  return response.json();
}

// ==================== RATINGS API ====================

export async function rateBook(accessToken: string, bookId: string, rating: number) {
  const response = await fetch(`${API_BASE}/books/${bookId}/rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Access-Token': accessToken,
    },
    body: JSON.stringify({ rating }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to rate book');
  }

  return response.json();
}

export async function getUserBookRating(accessToken: string, bookId: string): Promise<{ rating: number | null }> {
  const response = await fetch(`${API_BASE}/books/${bookId}/my-rating`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-Access-Token': accessToken,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get rating');
  }

  return response.json();
}

export async function getBookRatings(): Promise<{ ratings: Array<{ bookId: string; averageRating: number; totalRatings: number }> }> {
  const response = await fetch(`${API_BASE}/books/ratings/all`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get ratings');
  }

  return response.json();
}