import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token", "X-Access-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client for admin operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Create Supabase storage bucket on startup
const bucketName = 'make-58aa32b3-books';
try {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  if (!bucketExists) {
    await supabaseAdmin.storage.createBucket(bucketName, { public: false });
    console.log(`Created storage bucket: ${bucketName}`);
  }
} catch (error) {
  console.error('Error creating storage bucket:', error);
}

// Health check endpoint
app.get("/make-server-58aa32b3/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ENDPOINTS ====================

// Sign up endpoint
app.post("/make-server-58aa32b3/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { firstName, lastName, dateOfBirth, country, city, aboutMe, password } = body;

    if (!firstName || !password) {
      return c.json({ error: 'Имя и пароль обязательны' }, 400);
    }

    // Generate unique login
    const login = `${firstName.toLowerCase()}_${Date.now()}`;

    console.log('Creating user with login:', login);

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: `${login}@booksite.local`,
      password: password,
      user_metadata: {
        login,
        firstName,
        lastName,
        dateOfBirth,
        country,
        city,
        aboutMe,
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('User created in Supabase Auth:', data.user.id);

    // Store user profile in KV store
    const userProfile = {
      id: data.user.id,
      login,
      firstName,
      lastName,
      dateOfBirth,
      country,
      city,
      aboutMe,
      favorites: [],
      recent: [],
    };
    
    await kv.set(`user:${data.user.id}`, userProfile);
    console.log('User profile saved to KV store:', userProfile);

    return c.json({ 
      success: true, 
      login, 
      password, // Return the original password so user can sign in
      message: 'Пользователь успешно создан' 
    });
  } catch (error) {
    console.error('Error in signup:', error);
    return c.json({ error: 'Внутренняя ошибка сервера' }, 500);
  }
});

// Sign in endpoint
app.post("/make-server-58aa32b3/auth/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { login, password } = body;

    if (!login || !password) {
      return c.json({ error: 'Логин и пароль обязательны' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Sign in with email format
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${login}@booksite.local`,
      password: password,
    });

    if (error) {
      console.error('Sign in error:', error);
      // Provide more user-friendly error message
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        return c.json({ error: 'Неверный логин или пароль. Пожалуйста, проверьте введенные данные или зарегистрируйтесь.' }, 401);
      }
      return c.json({ error: 'Ошибка входа: ' + error.message }, 401);
    }

    if (!data.session) {
      return c.json({ error: 'Не удалось создать сессию' }, 401);
    }

    return c.json({ 
      success: true, 
      accessToken: data.session.access_token,
      user: data.user
    });
  } catch (error) {
    console.error('Error in signin:', error);
    return c.json({ error: 'Внутренняя ошибка сервера' }, 500);
  }
});

// Get current user profile
app.get("/make-server-58aa32b3/auth/me", async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      console.error('No access token provided');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      console.error('Error validating user token:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('Getting profile for user:', user.id);
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      console.error('Profile not found for user:', user.id);
      return c.json({ error: 'User profile not found' }, 404);
    }
    
    console.log('Profile found:', profile);
    return c.json({ user: profile });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Simple password hashing using SubtleCrypto
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Admin password hash (SHA-256 of '7777')
// TO CHANGE PASSWORD: Update this hash by running: hashPassword('your_new_password')
const ADMIN_PASSWORD_HASH = await hashPassword('7777');

// Token expiration time (24 hours in milliseconds)
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;

// Admin login
app.post("/make-server-58aa32b3/admin/login", async (c) => {
  try {
    const body = await c.req.json();
    const { password } = body;

    if (!password) {
      return c.json({ error: 'Password is required' }, 400);
    }

    // Hash the provided password
    const passwordHash = await hashPassword(password);
    
    if (passwordHash === ADMIN_PASSWORD_HASH) {
      // Generate a secure random admin token
      const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
      const tokenArray = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const adminToken = 'admin_' + tokenArray;
      
      // Store token with expiration
      const expiresAt = Date.now() + TOKEN_EXPIRATION_MS;
      await kv.set(`admin_token:${adminToken}`, { 
        valid: true, 
        createdAt: Date.now(),
        expiresAt: expiresAt
      });
      
      return c.json({ success: true, token: adminToken });
    }

    console.warn('Invalid admin login attempt');
    return c.json({ error: 'Invalid password' }, 401);
  } catch (error) {
    console.error('Error in admin login:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Verify admin token middleware with expiration check
const verifyAdmin = async (token: string) => {
  if (!token) return false;
  
  const adminData = await kv.get(`admin_token:${token}`);
  if (!adminData || !adminData.valid) return false;
  
  // Check if token has expired
  if (adminData.expiresAt && Date.now() > adminData.expiresAt) {
    // Delete expired token
    await kv.del(`admin_token:${token}`);
    return false;
  }
  
  return true;
};

// Get all users (admin only)
app.get("/make-server-58aa32b3/admin/users", async (c) => {
  try {
    const token = c.req.header('X-Admin-Token');
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const users = await kv.getByPrefix('user:');
    return c.json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Add book (admin only)
app.post("/make-server-58aa32b3/admin/books", async (c) => {
  try {
    const token = c.req.header('X-Admin-Token');
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const summary = formData.get('summary') as string;
    const category = formData.get('category') as string;
    const pdfFile = formData.get('pdfFile') as File | null;
    const coverImageFile = formData.get('coverImage') as File | null;

    if (!title || !author || !description || !summary || !category) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const bookId = `book_${Date.now()}`;
    
    // Upload PDF to Supabase Storage if provided
    let pdfUrl = null;
    if (pdfFile) {
      try {
        const fileName = `${bookId}.pdf`;
        const arrayBuffer = await pdfFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(fileName, bytes, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading PDF:', uploadError);
          return c.json({ error: 'Failed to upload PDF: ' + uploadError.message }, 500);
        }

        // Get signed URL with 1 year expiry
        const { data: signedData } = await supabaseAdmin.storage
          .from(bucketName)
          .createSignedUrl(fileName, 31536000);

        pdfUrl = signedData?.signedUrl;
      } catch (pdfError) {
        console.error('Error processing PDF:', pdfError);
        return c.json({ error: 'Failed to process PDF file: ' + (pdfError instanceof Error ? pdfError.message : 'Unknown error') }, 500);
      }
    }

    // Upload cover image to Supabase Storage if provided
    let coverImageUrl = null;
    if (coverImageFile) {
      try {
        const arrayBuffer = await coverImageFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Determine extension from file type
        const ext = coverImageFile.type.split('/')[1] || 'jpg';
        const fileName = `${bookId}_cover.${ext}`;
        
        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(fileName, bytes, {
            contentType: coverImageFile.type,
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          // Don't fail the whole request if cover upload fails
          console.log('Continuing without cover image');
        } else {
          // Get signed URL with 1 year expiry
          const { data: signedData } = await supabaseAdmin.storage
            .from(bucketName)
            .createSignedUrl(fileName, 31536000);

          coverImageUrl = signedData?.signedUrl;
        }
      } catch (imageError) {
        console.error('Error processing cover image:', imageError);
        // Continue without cover image
      }
    }

    const book = {
      id: bookId,
      title,
      author,
      description,
      summary,
      category,
      pdfUrl,
      coverImageUrl,
      createdAt: Date.now(),
    };

    await kv.set(`book:${bookId}`, book);

    return c.json({ success: true, book });
  } catch (error) {
    console.error('Error adding book:', error);
    return c.json({ error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 500);
  }
});

// Delete book (admin only)
app.delete("/make-server-58aa32b3/admin/books/:id", async (c) => {
  try {
    const token = c.req.header('X-Admin-Token');
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookId = c.req.param('id');
    
    // Get book to find files
    const book = await kv.get(`book:${bookId}`);
    
    // Delete PDF from storage if exists
    if (book?.pdfUrl) {
      try {
        await supabaseAdmin.storage
          .from(bucketName)
          .remove([`${bookId}.pdf`]);
      } catch (e) {
        console.error('Error deleting PDF:', e);
      }
    }

    // Delete cover image from storage if exists
    if (book?.coverImageUrl) {
      try {
        // Try to delete with common image extensions
        const extensions = ['jpg', 'jpeg', 'png', 'webp'];
        for (const ext of extensions) {
          await supabaseAdmin.storage
            .from(bucketName)
            .remove([`${bookId}_cover.${ext}`]);
        }
      } catch (e) {
        console.error('Error deleting cover image:', e);
      }
    }

    // Delete book from KV
    await kv.del(`book:${bookId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== BOOKS ENDPOINTS ====================

// Get all books
app.get("/make-server-58aa32b3/books", async (c) => {
  try {
    const books = await kv.getByPrefix('book:');
    return c.json({ books });
  } catch (error) {
    console.error('Error getting books:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single book
app.get("/make-server-58aa32b3/books/:id", async (c) => {
  try {
    const bookId = c.req.param('id');
    const book = await kv.get(`book:${bookId}`);
    
    if (!book) {
      return c.json({ error: 'Book not found' }, 404);
    }

    return c.json({ book });
  } catch (error) {
    console.error('Error getting book:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== USER ACTIONS ====================

// Add to favorites
app.post("/make-server-58aa32b3/user/favorites", async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { bookId } = body;

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    const favorites = profile.favorites || [];
    if (!favorites.includes(bookId)) {
      favorites.push(bookId);
      profile.favorites = favorites;
      await kv.set(`user:${user.id}`, profile);
    }

    return c.json({ success: true, favorites });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Remove from favorites
app.delete("/make-server-58aa32b3/user/favorites/:bookId", async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookId = c.req.param('bookId');

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    const favorites = (profile.favorites || []).filter((id: string) => id !== bookId);
    profile.favorites = favorites;
    await kv.set(`user:${user.id}`, profile);

    return c.json({ success: true, favorites });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Add to recent
app.post("/make-server-58aa32b3/user/recent", async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { bookId } = body;

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    let recent = profile.recent || [];
    // Remove if already exists
    recent = recent.filter((id: string) => id !== bookId);
    // Add to beginning
    recent.unshift(bookId);
    // Keep only last 20
    recent = recent.slice(0, 20);
    
    profile.recent = recent;
    await kv.set(`user:${user.id}`, profile);

    return c.json({ success: true, recent });
  } catch (error) {
    console.error('Error adding to recent:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== COMMENTS ENDPOINTS ====================

// Add comment to book
app.post("/make-server-58aa32b3/books/:bookId/comments", async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookId = c.req.param('bookId');
    const body = await c.req.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return c.json({ error: 'Comment text is required' }, 400);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    const commentId = `comment:${bookId}:${Date.now()}`;
    const comment = {
      id: commentId,
      bookId,
      userId: user.id,
      userName: userProfile.firstName + ' ' + userProfile.lastName,
      userLogin: userProfile.login,
      text: text.trim(),
      createdAt: Date.now(),
    };

    await kv.set(commentId, comment);

    return c.json({ success: true, comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get comments for a book
app.get("/make-server-58aa32b3/books/:bookId/comments", async (c) => {
  try {
    const bookId = c.req.param('bookId');
    const comments = await kv.getByPrefix(`comment:${bookId}:`);
    
    // Sort by creation time (newest first)
    comments.sort((a: any, b: any) => b.createdAt - a.createdAt);

    return c.json({ comments });
  } catch (error) {
    console.error('Error getting comments:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all comments (admin only)
app.get("/make-server-58aa32b3/admin/comments", async (c) => {
  try {
    const token = c.req.header('X-Admin-Token');
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const comments = await kv.getByPrefix('comment:');
    
    // Sort by creation time (newest first)
    comments.sort((a: any, b: any) => b.createdAt - a.createdAt);

    return c.json({ comments });
  } catch (error) {
    console.error('Error getting all comments:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete comment (admin only)
app.delete("/make-server-58aa32b3/admin/comments/:commentId", async (c) => {
  try {
    const token = c.req.header('X-Admin-Token');
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const commentId = c.req.param('commentId');
    await kv.del(commentId);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== FEEDBACK ENDPOINTS ====================

// Submit feedback
app.post("/make-server-58aa32b3/feedback", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    const feedbackId = `feedback:${Date.now()}`;
    const feedback = {
      id: feedbackId,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: Date.now(),
    };

    await kv.set(feedbackId, feedback);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all feedback (admin only)
app.get("/make-server-58aa32b3/admin/feedback", async (c) => {
  try {
    const token = c.req.header('X-Admin-Token');
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const feedback = await kv.getByPrefix('feedback:');
    
    // Sort by creation time (newest first)
    feedback.sort((a: any, b: any) => b.createdAt - a.createdAt);

    return c.json({ feedback });
  } catch (error) {
    console.error('Error getting feedback:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete feedback (admin only)
app.delete("/make-server-58aa32b3/admin/feedback/:feedbackId", async (c) => {
  try {
    const token = c.req.header('X-Admin-Token');
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const feedbackId = c.req.param('feedbackId');
    await kv.del(feedbackId);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== ADMIN UPDATE BOOK ====================

// Update book (admin only)
app.put("/make-server-58aa32b3/admin/books/:id", async (c) => {
  try {
    const token = c.req.header('X-Admin-Token');
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookId = c.req.param('id');
    const formData = await c.req.formData();

    const title = formData.get('title')?.toString();
    const author = formData.get('author')?.toString();
    const description = formData.get('description')?.toString();
    const summary = formData.get('summary')?.toString();
    const category = formData.get('category')?.toString();

    // Get existing book
    const existingBook = await kv.get(`book:${bookId}`);
    if (!existingBook) {
      return c.json({ error: 'Book not found' }, 404);
    }

    let pdfUrl = existingBook.pdfUrl;
    let coverImageUrl = existingBook.coverImageUrl;

    // Handle PDF update
    const pdfFile = formData.get('pdf') as File | null;
    if (pdfFile) {
      try {
        const pdfBuffer = await pdfFile.arrayBuffer();
        const fileName = `${bookId}.pdf`;

        // Delete old PDF
        try {
          await supabaseAdmin.storage.from(bucketName).remove([fileName]);
        } catch (e) {
          console.log('No old PDF to delete');
        }

        // Upload new PDF
        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(fileName, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading PDF:', uploadError);
          throw uploadError;
        }

        const { data: signedData } = await supabaseAdmin.storage
          .from(bucketName)
          .createSignedUrl(fileName, 31536000);

        pdfUrl = signedData?.signedUrl;
      } catch (pdfError) {
        console.error('Error updating PDF:', pdfError);
        return c.json({ error: 'Failed to update PDF file' }, 500);
      }
    }

    // Handle cover image update
    const coverImageFile = formData.get('coverImage') as File | null;
    if (coverImageFile) {
      try {
        const imageBuffer = await coverImageFile.arrayBuffer();
        const fileExtension = coverImageFile.name.split('.').pop() || 'jpg';
        const fileName = `${bookId}_cover.${fileExtension}`;

        // Delete old cover images
        try {
          const extensions = ['jpg', 'jpeg', 'png', 'webp'];
          for (const ext of extensions) {
            await supabaseAdmin.storage.from(bucketName).remove([`${bookId}_cover.${ext}`]);
          }
        } catch (e) {
          console.log('No old cover to delete');
        }

        // Upload new cover
        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(fileName, imageBuffer, {
            contentType: coverImageFile.type,
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          throw uploadError;
        }

        const { data: signedData } = await supabaseAdmin.storage
          .from(bucketName)
          .createSignedUrl(fileName, 31536000);

        coverImageUrl = signedData?.signedUrl;
      } catch (imageError) {
        console.error('Error updating cover image:', imageError);
        // Continue without updating cover
      }
    }

    const updatedBook = {
      ...existingBook,
      title: title || existingBook.title,
      author: author || existingBook.author,
      description: description || existingBook.description,
      summary: summary || existingBook.summary,
      category: category || existingBook.category,
      pdfUrl,
      coverImageUrl,
      updatedAt: Date.now(),
    };

    await kv.set(`book:${bookId}`, updatedBook);

    return c.json({ success: true, book: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    return c.json({ error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 500);
  }
});

// ==================== RATINGS ENDPOINTS ====================

// Rate a book (user endpoint)
app.post("/make-server-58aa32b3/books/:bookId/rate", async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Missing access token' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401);
    }

    const bookId = c.req.param('bookId');
    const { rating } = await c.req.json();

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    // Store rating as: rating:{bookId}:{userId}
    const ratingKey = `rating:${bookId}:${user.id}`;
    await kv.set(ratingKey, { rating, bookId, userId: user.id, createdAt: Date.now() });

    return c.json({ success: true, rating });
  } catch (error) {
    console.error('Error rating book:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user's rating for a book
app.get("/make-server-58aa32b3/books/:bookId/my-rating", async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Missing access token' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401);
    }

    const bookId = c.req.param('bookId');
    const ratingKey = `rating:${bookId}:${user.id}`;
    const ratingData = await kv.get(ratingKey);

    return c.json({ rating: ratingData?.rating || null });
  } catch (error) {
    console.error('Error getting user rating:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all ratings statistics
app.get("/make-server-58aa32b3/books/ratings/all", async (c) => {
  try {
    // Get all ratings with prefix
    const allRatings = await kv.getByPrefix('rating:');
    
    // Group by bookId and calculate averages
    const bookRatings: { [key: string]: { total: number; count: number } } = {};
    
    for (const ratingData of allRatings) {
      if (ratingData && ratingData.bookId && typeof ratingData.rating === 'number') {
        if (!bookRatings[ratingData.bookId]) {
          bookRatings[ratingData.bookId] = { total: 0, count: 0 };
        }
        bookRatings[ratingData.bookId].total += ratingData.rating;
        bookRatings[ratingData.bookId].count += 1;
      }
    }

    const ratings = Object.entries(bookRatings).map(([bookId, data]) => ({
      bookId,
      averageRating: data.total / data.count,
      totalRatings: data.count,
    }));

    return c.json({ ratings });
  } catch (error) {
    console.error('Error getting all ratings:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);