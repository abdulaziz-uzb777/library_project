import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { getBook, addToFavorites, removeFromFavorites, addToRecent, getCurrentUser, getComments, addComment, rateBook, getUserBookRating, type Comment } from '../../utils/api';
import type { Book } from '../../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { ArrowLeft, Download, Heart, BookOpen, MessageCircle, Send, Sparkles, Star } from 'lucide-react';
import AuthDialog from '../components/AuthDialog';
import StarRating from '../components/StarRating';
import Footer from '../components/Footer';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, accessToken, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (id) {
      loadBook(id);
      loadComments(id);
      loadUserRating(id);
    }
  }, [id]);

  useEffect(() => {
    if (user && book) {
      setIsFavorite(user.favorites?.includes(book.id) || false);
    }
  }, [user, book]);

  const loadBook = async (bookId: string) => {
    try {
      const { book } = await getBook(bookId);
      setBook(book);

      // Add to recent if user is logged in
      if (accessToken) {
        try {
          await addToRecent(accessToken, bookId);
          // Refresh user data
          const { user: updatedUser } = await getCurrentUser(accessToken);
          updateUser(updatedUser);
        } catch (error) {
          console.error('Error adding to recent:', error);
        }
      }
    } catch (error) {
      console.error('Error loading book:', error);
      const msg = language === 'en' ? 'Book not found' : language === 'ru' ? 'Книга не найдена' : 'Kitob topilmadi';
      toast.error(msg);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !accessToken) {
      const msg = language === 'en' ? 'Please sign in to add to favorites' : 
                  language === 'ru' ? 'Войдите в систему, чтобы добавить в избранное' : 
                  'Sevimlilar ro\'yxatiga qo\'shish uchun kiring';
      toast.error(msg);
      setAuthDialogOpen(true);
      return;
    }

    if (!book) return;

    try {
      if (isFavorite) {
        await removeFromFavorites(accessToken, book.id);
        toast.success(t('book.removedFromFavorites'));
      } else {
        await addToFavorites(accessToken, book.id);
        toast.success(t('book.addedToFavorites'));
      }

      // Refresh user data
      const { user: updatedUser } = await getCurrentUser(accessToken);
      updateUser(updatedUser);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      const msg = language === 'en' ? 'Error updating favorites' : 
                  language === 'ru' ? 'Ошибка при изменении избранного' : 
                  'Sevimlilar yangilashda xato';
      toast.error(msg);
    }
  };

  const handleDownload = () => {
    if (!book?.pdfUrl) {
      const msg = language === 'en' ? 'PDF file not available' : 
                  language === 'ru' ? 'PDF файл недоступен' : 
                  'PDF fayl mavjud emas';
      toast.error(msg);
      return;
    }

    window.open(book.pdfUrl, '_blank');
    const msg = language === 'en' ? 'Opening PDF file' : 
                language === 'ru' ? 'Открытие PDF файла' : 
                'PDF fayl ochilmoqda';
    toast.success(msg);
  };

  const loadComments = async (bookId: string) => {
    try {
      const { comments } = await getComments(bookId);
      setComments(comments);
    } catch (error) {
      console.error('Error loading comments:', error);
      const msg = language === 'en' ? 'Error loading comments' : 
                  language === 'ru' ? 'Ошибка при загрузке комментариев' : 
                  'Izohlarni yuklashda xato';
      toast.error(msg);
    }
  };

  const handleAddComment = async () => {
    if (!user || !accessToken) {
      toast.error(t('book.loginToComment'));
      setAuthDialogOpen(true);
      return;
    }

    if (!book) return;

    if (!commentText.trim()) {
      const msg = language === 'en' ? 'Comment cannot be empty' : 
                  language === 'ru' ? 'Комментарий не может быть пустым' : 
                  'Izoh bo\'sh bo\'lishi mumkin emas';
      toast.error(msg);
      return;
    }

    setIsSubmittingComment(true);

    try {
      const { comment } = await addComment(accessToken, book.id, commentText);
      setComments([...comments, comment]);
      setCommentText('');
      toast.success(t('book.commentPosted'));
    } catch (error) {
      console.error('Error adding comment:', error);
      const msg = language === 'en' ? 'Error adding comment' : 
                  language === 'ru' ? 'Ошибка при добавлении комментария' : 
                  'Izoh qo\'shishda xato';
      toast.error(msg);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const loadUserRating = async (bookId: string) => {
    if (!user || !accessToken) return;

    try {
      const { rating } = await getUserBookRating(accessToken, bookId);
      setUserRating(rating);
    } catch (error) {
      console.error('Error loading user rating:', error);
      const msg = language === 'en' ? 'Error loading user rating' : 
                  language === 'ru' ? 'Ошибка при загрузке оценки пользователя' : 
                  'Foydalanuvchi reytingini yuklashda xato';
      toast.error(msg);
    }
  };

  const handleRateBook = async (rating: number) => {
    if (!user || !accessToken) {
      toast.error(t('book.loginToRate'));
      setAuthDialogOpen(true);
      return;
    }

    if (!book) return;

    setIsSubmittingRating(true);

    try {
      await rateBook(accessToken, book.id, rating);
      setUserRating(rating);
      toast.success(t('book.ratingSubmitted'));
    } catch (error) {
      console.error('Error rating book:', error);
      const msg = language === 'en' ? 'Error rating book' : 
                  language === 'ru' ? 'Ошибка при оценке книги' : 
                  'Kitobni baholashda xato';
      toast.error(msg);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getCategoryLabel = (categoryValue: string) => {
    const categories = [
      'Все',
      'Роман',
      'Фантастика',
      'Фэнтези',
      'Детектив',
      'Любовный роман',
      'Приключения',
      'Научно-популярная литература',
      'Саморазвитие',
    ];
    const keys = [
      'category.all',
      'category.novel',
      'category.scifi',
      'category.fantasy',
      'category.detective',
      'category.romance',
      'category.adventure',
      'category.popular',
      'category.selfdevelopment',
    ];
    const index = categories.indexOf(categoryValue);
    if (index !== -1) {
      return t(keys[index]);
    }
    return categoryValue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  const backText = language === 'en' ? 'Back' : language === 'ru' ? 'Назад' : 'Orqaga';
  const authorText = language === 'en' ? 'Author' : language === 'ru' ? 'Автор' : 'Muallif';
  const summaryText = language === 'en' ? 'Summary' : language === 'ru' ? 'Краткий пересказ' : 'Qisqacha mazmuni';
  const loginPromptText = language === 'en' 
    ? 'Sign in to save books to favorites and track reading history' 
    : language === 'ru' 
    ? 'Войдите в систему, чтобы сохранять книги в избранное и отслеживать историю чтения' 
    : 'Kitoblarni sevimlilarga saqlash va o\'qish tarixini kuzatish uchun kiring';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/">
            <Button variant="ghost" className="gap-2 hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4" />
              {backText}
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors overflow-hidden">
            {book.coverImageUrl && (
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <CardHeader className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors">
                    {getCategoryLabel(book.category)}
                  </Badge>
                  <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {book.title}
                  </CardTitle>
                  <CardDescription className="text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {authorText}: <span className="font-semibold text-foreground">{book.author}</span>
                  </CardDescription>
                </div>
                <Button
                  variant={isFavorite ? 'default' : 'outline'}
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={`border-2 ${isFavorite ? 'shadow-lg' : 'hover:border-primary'} transition-all`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              <div className="bg-accent/30 p-6 rounded-xl border-2 border-accent/50">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {t('book.description')}
                </h3>
                <p className="text-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>

              <Separator />

              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">{summaryText}</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {book.summary}
                </p>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                {book.pdfUrl ? (
                  <Button onClick={handleDownload} className="flex-1 shadow-lg" size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    {t('book.download')}
                  </Button>
                ) : (
                  <Button disabled className="flex-1" size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    {language === 'en' ? 'PDF unavailable' : language === 'ru' ? 'PDF недоступен' : 'PDF mavjud emas'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleToggleFavorite}
                  className="flex-1 border-2 hover:border-primary hover:bg-primary/10"
                  size="lg"
                >
                  <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? t('book.removeFromFavorites') : t('book.addToFavorites')}
                </Button>
              </div>

              {!user && (
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl text-center border-2 border-primary/30">
                  <p className="text-sm font-medium text-foreground mb-3">
                    {loginPromptText}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setAuthDialogOpen(true)}
                  >
                    {t('header.login')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className="mt-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="h-7 w-7 text-primary" />
              {t('book.comments')} ({comments.length})
            </h2>
            
            {/* Add Comment Form */}
            {user ? (
              <Card className="mb-6 border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('book.writeComment')}
                    className="min-h-[100px] mb-3 border-2 focus:border-primary"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="shadow-md"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmittingComment 
                      ? (language === 'en' ? 'Posting...' : language === 'ru' ? 'Отправка...' : 'Yuborilmoqda...') 
                      : t('book.postComment')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="pt-6 text-center">
                  <p className="text-foreground font-medium mb-3">
                    {t('book.loginToComment')}
                  </p>
                  <Button onClick={() => setAuthDialogOpen(true)} variant="outline" className="border-2 border-primary hover:bg-primary hover:text-primary-foreground">
                    {t('header.login')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <div className="bg-muted/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <MessageCircle className="h-10 w-10 opacity-50" />
                    </div>
                    <p className="font-medium">{t('book.noComments')}</p>
                    <p className="text-sm mt-1">{t('book.beFirst')}</p>
                  </CardContent>
                </Card>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} className="border-2 hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                          <span className="text-sm font-bold text-primary-foreground">
                            {comment.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              @{comment.userLogin}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(comment.createdAt).toLocaleDateString(
                              language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', 
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                          <p className="text-foreground leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Rating Section */}
          <div className="mt-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-7 w-7 text-primary" />
              {t('book.rating')}
            </h2>
            
            {/* Add Rating Form */}
            {user ? (
              <Card className="mb-6 border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <StarRating
                    rating={userRating}
                    onRate={handleRateBook}
                    isSubmitting={isSubmittingRating}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="pt-6 text-center">
                  <p className="text-foreground font-medium mb-3">
                    {t('book.loginToRate')}
                  </p>
                  <Button onClick={() => setAuthDialogOpen(true)} variant="outline" className="border-2 border-primary hover:bg-primary hover:text-primary-foreground">
                    {t('header.login')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
}