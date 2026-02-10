import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getBooks } from '../../utils/api';
import type { Book } from '../../utils/api';
import { Search, BookOpen, LogIn, User, Grid3x3, X, Languages } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AuthDialog from '../components/AuthDialog';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import Footer from '../components/Footer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { TrendingUp, Code } from 'lucide-react';

const CATEGORY_KEYS = [
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

const CATEGORY_VALUES = [
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

export default function HomePage() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

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

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (categoryValue: string) => {
    const index = CATEGORY_VALUES.indexOf(categoryValue);
    if (index !== -1) {
      return t(CATEGORY_KEYS[index]);
    }
    return categoryValue;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
            <div className="bg-primary rounded-lg p-1.5">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('header.library')}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <BookOpen className="h-4 w-4" />
                {t('header.home')}
              </Button>
            </Link>
            <Link to="/statistics">
              <Button variant="ghost" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('header.statistics')}
              </Button>
            </Link>
            <Link to="/api">
              <Button variant="ghost" className="gap-2">
                <Code className="h-4 w-4" />
                {t('header.api')}
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Languages className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {language.toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                  <span className={language === 'en' ? 'font-bold text-primary' : ''}>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ru')} className="cursor-pointer">
                  <span className={language === 'ru' ? 'font-bold text-primary' : ''}>Русский</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('uz')} className="cursor-pointer">
                  <span className={language === 'uz' ? 'font-bold text-primary' : ''}>O'zbek</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.firstName}</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  {t('header.logout')}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setAuthDialogOpen(true)} className="gap-2 shadow-md">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t('header.login')}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            {language === 'en' && 'Discover the World of Books'}
            {language === 'ru' && 'Откройте мир книг'}
            {language === 'uz' && 'Kitoblar dunyosini kashf eting'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' && 'Read, download and enjoy the best works'}
            {language === 'ru' && 'Читайте, скачивайте и наслаждайтесь лучшими произведениями'}
            {language === 'uz' && 'O\'qing, yuklab oling va eng yaxshi asarlardan bahramand bo\'ling'}
          </p>
        </div>

        {/* Search and Categories Button */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="search"
                placeholder={t('home.search')}
                className="pl-10 h-12 shadow-sm border-2 focus:border-primary transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setCategoriesPanelOpen(true)}
              className="flex items-center gap-2 whitespace-nowrap h-12 px-6 border-2 hover:border-primary transition-colors shadow-sm"
            >
              <Grid3x3 className="h-5 w-5" />
              <span className="hidden sm:inline">{t('home.categories')}</span>
            </Button>
          </div>

          {/* Selected Category Display */}
          {selectedCategory !== 'Все' && (
            <div className="mt-4 flex items-center gap-2 bg-accent/50 p-3 rounded-lg border">
              <span className="text-sm font-medium">{language === 'en' ? 'Selected:' : language === 'ru' ? 'Выбрано:' : 'Tanlangan:'}</span>
              <Badge variant="secondary" className="text-sm font-medium bg-primary/20 text-primary border-primary/30">
                {getCategoryLabel(selectedCategory)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory('Все')}
                className="h-7 px-3 text-xs ml-auto"
              >
                {language === 'en' ? 'Reset' : language === 'ru' ? 'Сбросить' : 'Bekor qilish'}
              </Button>
            </div>
          )}
        </div>

        {/* Categories Side Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-background border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            categoriesPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Grid3x3 className="h-5 w-5 text-primary" />
                {language === 'en' && 'Book Categories'}
                {language === 'ru' && 'Категории книг'}
                {language === 'uz' && 'Kitob kategoriyalari'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCategoriesPanelOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {CATEGORY_VALUES.map((category, index) => {
                  const bookCount = category === 'Все'
                    ? books.length
                    : books.filter(b => b.category === category).length;

                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setCategoriesPanelOpen(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                          : 'bg-card hover:bg-accent hover:border-primary/30 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{getCategoryLabel(category)}</span>
                        <Badge
                          variant={selectedCategory === category ? 'secondary' : 'outline'}
                          className="ml-2"
                        >
                          {bookCount}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {categoriesPanelOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setCategoriesPanelOpen(false)}
          />
        )}

        {/* Books Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">{t('home.loading')}</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted/50 rounded-full p-8 w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold text-foreground mb-2">
              {t('home.noBooks')}
            </p>
            <p className="text-muted-foreground">
              {books.length === 0
                ? (language === 'en' ? 'Administrator will add books soon' : language === 'ru' ? 'Администратор скоро добавит книги' : 'Administrator tez orada kitoblar qo\'shadi')
                : (language === 'en' ? 'Try changing search parameters' : language === 'ru' ? 'Попробуйте изменить параметры поиска' : 'Qidiruv parametrlarini o\'zgartirib ko\'ring')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
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
      </main>

      <Footer />
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
}