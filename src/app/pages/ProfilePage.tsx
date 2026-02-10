import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getBooks } from '../../utils/api';
import type { Book } from '../../utils/api';
import { ArrowLeft, Heart, Clock, User as UserIcon, MapPin, Calendar, BookMarked } from 'lucide-react';
import Footer from '../components/Footer';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadBooks();
  }, [user, navigate]);

  const loadBooks = async () => {
    try {
      const { books } = await getBooks();
      setBooks(books);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const favoriteBooks = books.filter((book) => user.favorites?.includes(book.id));
  const recentBooks = (user.recent || [])
    .map((bookId) => books.find((b) => b.id === bookId))
    .filter((book): book is Book => book !== undefined);

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

  const homeText = language === 'en' ? 'Home' : language === 'ru' ? 'Главная' : 'Bosh sahifa';
  const countryText = language === 'en' ? 'Country' : language === 'ru' ? 'Страна' : 'Mamlakat';
  const cityText = language === 'en' ? 'City' : language === 'ru' ? 'Город' : 'Shahar';
  const dobText = language === 'en' ? 'Date of Birth' : language === 'ru' ? 'Дата рождения' : 'Tug\'ilgan kun';
  const favoritesCountText = language === 'en' ? 'books' : language === 'ru' ? 'книг' : 'kitob';
  const aboutMeText = language === 'en' ? 'About Me' : language === 'ru' ? 'О себе' : 'O\'zim haqimda';
  const goToBooksText = language === 'en' ? 'Go to Books' : language === 'ru' ? 'Перейти к книгам' : 'Kitoblarga o\'tish';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="gap-2 hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4" />
              {homeText}
            </Button>
          </Link>
          <Button variant="outline" onClick={logout} className="border-2 hover:border-primary">
            {t('header.logout')}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Profile Info */}
          <Card className="mb-8 border-2 hover:border-primary/50 transition-colors overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                  <UserIcon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription className="text-base bg-muted px-2 py-0.5 rounded-full inline-block mt-1">
                    @{user.login}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-accent/30 p-4 rounded-xl border-2 border-accent/50">
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" />
                    {countryText}
                  </p>
                  <p className="font-semibold">{user.country}</p>
                </div>
                <div className="bg-accent/30 p-4 rounded-xl border-2 border-accent/50">
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" />
                    {cityText}
                  </p>
                  <p className="font-semibold">{user.city}</p>
                </div>
                <div className="bg-accent/30 p-4 rounded-xl border-2 border-accent/50">
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    {dobText}
                  </p>
                  <p className="font-semibold">{user.dateOfBirth}</p>
                </div>
                <div className="bg-accent/30 p-4 rounded-xl border-2 border-accent/50">
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <BookMarked className="h-3 w-3" />
                    {t('profile.favorites')}
                  </p>
                  <p className="font-semibold">{user.favorites?.length || 0} {favoritesCountText}</p>
                </div>
              </div>
              {user.aboutMe && (
                <div className="mt-4 bg-primary/5 p-4 rounded-xl border-2 border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">{aboutMeText}</p>
                  <p className="text-foreground">{user.aboutMe}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="favorites" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 border-2">
              <TabsTrigger value="favorites" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Heart className="h-4 w-4" />
                {t('profile.favorites')} ({favoriteBooks.length})
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock className="h-4 w-4" />
                {t('profile.recent')} ({recentBooks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : favoriteBooks.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="bg-muted/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Heart className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-xl font-semibold text-foreground mb-2">
                      {t('profile.noFavorites')}
                    </p>
                    <p className="text-muted-foreground mb-4">
                      {t('profile.addToFavorites')}
                    </p>
                    <Link to="/">
                      <Button className="shadow-md">{goToBooksText}</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favoriteBooks.map((book) => (
                    <Link key={book.id} to={`/book/${book.id}`}>
                      <Card className="h-full hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden border-2 hover:border-primary/50 group">
                        {book.coverImageUrl && (
                          <div className="aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                            <img
                              src={book.coverImageUrl}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader className="space-y-2">
                          <Badge className="w-fit bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors">
                            {getCategoryLabel(book.category)}
                          </Badge>
                          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{book.title}</CardTitle>
                          <CardDescription className="font-medium">{book.author}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {book.description}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all">
                            {t('home.readMore')}
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : recentBooks.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="bg-muted/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Clock className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-xl font-semibold text-foreground mb-2">
                      {t('profile.noRecent')}
                    </p>
                    <p className="text-muted-foreground mb-4">
                      {t('profile.viewBooks')}
                    </p>
                    <Link to="/">
                      <Button className="shadow-md">{goToBooksText}</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recentBooks.map((book) => (
                    <Link key={book.id} to={`/book/${book.id}`}>
                      <Card className="h-full hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden border-2 hover:border-primary/50 group">
                        {book.coverImageUrl && (
                          <div className="aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                            <img
                              src={book.coverImageUrl}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader className="space-y-2">
                          <Badge className="w-fit bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors">
                            {getCategoryLabel(book.category)}
                          </Badge>
                          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{book.title}</CardTitle>
                          <CardDescription className="font-medium">{book.author}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {book.description}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all">
                            {t('home.readMore')}
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
