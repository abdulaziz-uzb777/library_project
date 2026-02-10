import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { adminLogin, addBook, getUsers, deleteBook, getBooks, getFeedback, deleteFeedback, deleteComment, updateBook, getAllComments, type Comment, type Feedback } from '../../utils/api';
import type { Book, UserProfile } from '../../utils/api';
import { toast } from 'sonner';
import { Trash2, BookOpen, Users, LogOut, Image as ImageIcon, X, MessageCircle, MessageSquare, Edit, AlertTriangle, Lock } from 'lucide-react';
import EditBookDialog from '../components/EditBookDialog';
import { Alert, AlertDescription } from '../components/ui/alert';

const CATEGORIES = [
  'Роман',
  'Фантастика',
  'Фэнтези',
  'Детектив',
  'Любовный роман',
  'Приключения',
  'Научно-популярная литература',
  'Саморазвитие',
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [sessionExpiresIn, setSessionExpiresIn] = useState<number | null>(null);
  
  // Book form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  // Session timeout effect (24 hours)
  useEffect(() => {
    if (!isLoggedIn) return;

    // Set initial session expiration
    const loginTime = localStorage.getItem('adminLoginTime');
    if (loginTime) {
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
      const expiresAt = parseInt(loginTime) + sessionDuration;
      const timeUntilExpiration = expiresAt - Date.now();
      setSessionExpiresIn(timeUntilExpiration);

      // Set timeout to logout when session expires
      const logoutTimer = setTimeout(() => {
        handleLogout();
        toast.error('Сеанс истек. Пожалуйста, введите пароль снова.');
      }, timeUntilExpiration);

      // Update session timer every minute
      const updateTimer = setInterval(() => {
        const remaining = expiresAt - Date.now();
        setSessionExpiresIn(Math.max(0, remaining));
        
        if (remaining <= 5 * 60 * 1000) { // Show warning in last 5 minutes
          // Session is expiring soon
        }
      }, 60000);

      return () => {
        clearTimeout(logoutTimer);
        clearInterval(updateTimer);
      };
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminToken(token);
      setIsLoggedIn(true);
      loadData(token);
    }
  }, []);

  const loadData = async (token: string) => {
    try {
      const [usersData, booksData] = await Promise.all([
        getUsers(token),
        getBooks(),
      ]);
      setUsers(usersData.users || []);
      setBooks(booksData.books || []);
      
      // Load feedback and comments separately
      try {
        const feedbackData = await getFeedback(token);
        setFeedback(feedbackData.feedback || []);
      } catch (e) {
        console.log('No feedback yet');
      }
      
      // Load all comments from all books
      try {
        const allCommentsData = await getAllComments(token);
        setAllComments(allCommentsData.comments || []);
      } catch (e) {
        console.log('No comments yet');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Don't show error toast on initial load if no data exists
      if (error instanceof Error && !error.message.includes('not found')) {
        toast.error('Ошибка загрузки данных: ' + error.message);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!password || password.trim().length === 0) {
      setLoginError('Пожалуйста, введите пароль');
      return;
    }

    try {
      setIsSubmitting(true);
      const { token } = await adminLogin(password);
      setAdminToken(token);
      setIsLoggedIn(true);
      setPassword('');
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminLoginTime', Date.now().toString());
      toast.success('Успешный вход в панель администратора');
      loadData(token);
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError('Неверный пароль. Доступ запрещен.');
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminToken('');
    setPassword('');
    setLoginError('');
    setSessionExpiresIn(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoginTime');
    navigate('/');
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !description || !summary || !category) {
      toast.error('Заполните все поля');
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate PDF size (max 50MB)
      if (pdfFile && pdfFile.size > 50 * 1024 * 1024) {
        toast.error('PDF файл слишком большой (максимум 50MB)');
        setIsSubmitting(false);
        return;
      }

      // Process cover image - resize and compress
      let processedCoverImage: File | undefined = undefined;
      if (coverImage) {
        // Validate image size (max 2MB before processing)
        if (coverImage.size > 2 * 1024 * 1024) {
          toast.error('Изображение слишком большое (максимум 2MB)');
          setIsSubmitting(false);
          return;
        }

        // Resize and compress image, then convert back to File
        const resizedBase64 = await resizeImage(coverImage, 800, 600);
        const blob = await fetch(resizedBase64).then(r => r.blob());
        processedCoverImage = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
      }

      const { book } = await addBook(adminToken, {
        title,
        author,
        description,
        summary,
        category,
        pdfFile,
        coverImageFile: processedCoverImage,
      });

      setBooks([...books, book]);
      toast.success('Книга успешно добавлена');
      
      // Reset form
      setTitle('');
      setAuthor('');
      setDescription('');
      setSummary('');
      setCategory('');
      setPdfFile(null);
      setCoverImage(null);
      setCoverImagePreview(null);
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Ошибка добавления книги: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to resize image
  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate dimensions maintaining 2:3 aspect ratio (portrait like books)
          const aspectRatio = 2 / 3;
          let width = maxWidth;
          let height = width / aspectRatio; // height should be 1.5x width
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw image centered and cropped to 2:3 ratio
          const sourceAspect = img.width / img.height;
          let sx, sy, sWidth, sHeight;

          if (sourceAspect > aspectRatio) {
            // Image is wider than target ratio
            sHeight = img.height;
            sWidth = img.height * aspectRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
          } else {
            // Image is taller than target ratio
            sWidth = img.width;
            sHeight = img.width / aspectRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);

          // Convert to base64 with quality compression
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCoverImage(null);
      setCoverImagePreview(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения');
      return;
    }

    setCoverImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) {
      return;
    }

    try {
      await deleteBook(adminToken, bookId);
      setBooks(books.filter(b => b.id !== bookId));
      toast.success('Книга удалена');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Ошибка удаления книги');
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      await deleteFeedback(adminToken, feedbackId);
      setFeedback(feedback.filter(f => f.id !== feedbackId));
      toast.success('Отзыв удален');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Ошибка удаления отзыва');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    try {
      await deleteComment(adminToken, commentId);
      setAllComments(allComments.filter(c => c.id !== commentId));
      toast.success('Комментарий удален');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Ошибка удаления комментария');
    }
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setEditDialogOpen(true);
  };

  const handleUpdateBook = async (updatedBook: Book) => {
    try {
      const { book } = await updateBook(adminToken, updatedBook);
      setBooks(books.map(b => b.id === book.id ? book : b));
      toast.success('Книга успешно обновлена');
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Ошибка обновления книги: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setEditDialogOpen(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Панель администратора</CardTitle>
            </div>
            <CardDescription>Защищенный доступ - введите пароль</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">
                  Пароль доступа
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmitting) {
                      handleLogin(e as any);
                    }
                  }}
                  className="text-base"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full font-medium"
                disabled={isSubmitting || password.length === 0}
                size="lg"
              >
                {isSubmitting ? 'Вход в процессе...' : 'Войти'}
              </Button>
              
              <div className="p-3 bg-accent/20 border border-accent/40 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>⚠️ Безопасность:</strong> Этот раздел защищен паролем. 
                  Используйте только надежный пароль и НЕ делитесь им с другими пользователями.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Панель администратора</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoggedIn && sessionExpiresIn ? 
                  `Сеанс истекает через ${Math.floor(sessionExpiresIn / 1000 / 60)} мин` 
                  : 'Управление системой'}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>

          {sessionExpiresIn && sessionExpiresIn < 5 * 60 * 1000 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Ваш сеанс истекает через {Math.floor(sessionExpiresIn / 1000 / 60)} минут. 
                Для продления сеанса введите пароль заново.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="books" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="books">
              <BookOpen className="mr-2 h-4 w-4" />
              Книги
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageCircle className="mr-2 h-4 w-4" />
              Комментарии
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="mr-2 h-4 w-4" />
              Отзывы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Добавить новую книгу</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBook} className="space-y-4">
                  <div className="bg-accent/30 border border-accent p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium mb-2">⚠️ Важно:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Максимальный размер PDF файла: 50 МБ</li>
                      <li>Максимальный размер изображения: 2 МБ</li>
                      <li>Изображение будет автоматически сжато в соотношение 2:3 (портрет)</li>
                      <li>Все поля кроме PDF и обложки обязательны для заполнения</li>
                    </ul>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="title">Название</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Название книги"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Автор</Label>
                      <Input
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Автор книги"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Описание книги"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="summary">Краткий пересказ</Label>
                    <Textarea
                      id="summary"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Краткий пересказ"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pdf">PDF файл (макс. 50MB, опционально)</Label>
                    <Input
                      id="pdf"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    />
                    {pdfFile && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Выбран: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="coverImage">Обложка книги (макс. 2MB, соотношение 2:3, опционально)</Label>
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Изображение будет автоматически сжато и обрезано до соотношения 2:3 (портрет)
                    </p>
                    {coverImagePreview && (
                      <div className="mt-3 relative inline-block">
                        <div className="aspect-[2/3] w-40 overflow-hidden rounded-lg border-2 border-primary">
                          <img
                            src={coverImagePreview}
                            alt="Предпросмотр обложки"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={handleRemoveCoverImage}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Удалить
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Добавление...' : 'Добавить книгу'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Управление книгами ({books.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {books.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Книги еще не добавлены
                    </p>
                  ) : (
                    books.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {book.author} • {book.category}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBook(book)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Зарегистрированные пользователи ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Пользователей еще нет
                    </p>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Логин: {user.login}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.country}, {user.city}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground text-right">
                            <p>Избранное: {user.favorites?.length || 0}</p>
                            <p>Недавние: {user.recent?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Комментарии ({allComments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allComments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Комментариев еще нет
                    </p>
                  ) : (
                    allComments.map((comment) => {
                      const book = books.find(b => b.id === comment.bookId);
                      return (
                        <div
                          key={comment.id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{comment.userName}</h3>
                                <span className="text-xs text-muted-foreground">
                                  @{comment.userLogin}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Книга: {book?.title || 'Неизвестно'}
                              </p>
                              <p className="text-sm">{comment.text}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Отзывы ({feedback.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedback.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Отзывов еще нет
                    </p>
                  ) : (
                    feedback.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{fb.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Email: {fb.email}
                            </p>
                            <p className="text-sm">{fb.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(fb.createdAt).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFeedback(fb.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EditBookDialog
        book={selectedBook}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={async (bookData) => {
          if (!selectedBook) return;
          await updateBook(adminToken, selectedBook.id, bookData);
          await loadData(adminToken);
          toast.success('Книга успешно обновлена');
          setEditDialogOpen(false);
        }}
      />
    </div>
  );
}