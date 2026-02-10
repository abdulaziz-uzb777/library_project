import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { getBooks, getBookRatings } from '../../utils/api';
import type { Book } from '../../utils/api';
import { ArrowLeft, TrendingUp, Star, Trophy, BookOpen } from 'lucide-react';
import Footer from '../components/Footer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface BookRating {
  bookId: string;
  averageRating: number;
  totalRatings: number;
}

export default function StatisticsPage() {
  const { t, language } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [ratings, setRatings] = useState<BookRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksData, ratingsData] = await Promise.all([
        getBooks(),
        getBookRatings()
      ]);
      
      setBooks(booksData.books);
      setRatings(ratingsData.ratings || []);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const backText = language === 'en' ? 'Back' : language === 'ru' ? 'Назад' : 'Orqaga';
  const statsTitle = language === 'en' ? 'Book Statistics' : language === 'ru' ? 'Статистика книг' : 'Kitoblar statistikasi';
  const statsDesc = language === 'en' ? 'View popular books and user ratings' : language === 'ru' ? 'Просмотр популярных книг и рейтингов пользователей' : 'Mashhur kitoblar va foydalanuvchi reytinglarini ko\'ring';
  const topRatedTitle = language === 'en' ? 'Top Rated Books' : language === 'ru' ? 'Книги с наивысшим рейтингом' : 'Eng yuqori reytingli kitoblar';
  const ratingsChartTitle = language === 'en' ? 'Average Ratings by Book' : language === 'ru' ? 'Средний рейтинг по книгам' : 'Kitoblar bo\'yicha o\'rtacha reyting';
  const totalRatingsTitle = language === 'en' ? 'Total Ratings Count' : language === 'ru' ? 'Общее количество оценок' : 'Umumiy baholashlar soni';
  const noDataText = language === 'en' ? 'No ratings data available yet' : language === 'ru' ? 'Данные о рейтингах пока недоступны' : 'Reytinglar ma\'lumotlari hali mavjud emas';
  const avgRatingText = language === 'en' ? 'Avg Rating' : language === 'ru' ? 'Ср. рейтинг' : 'O\'rtacha reyting';
  const totalText = language === 'en' ? 'ratings' : language === 'ru' ? 'оценок' : 'baho';

  // Combine books with ratings
  const booksWithRatings = books.map(book => {
    const rating = ratings.find(r => r.bookId === book.id);
    return {
      ...book,
      averageRating: rating?.averageRating || 0,
      totalRatings: rating?.totalRatings || 0,
    };
  }).sort((a, b) => b.averageRating - a.averageRating);

  // Top 10 books for chart
  const top10Books = booksWithRatings.slice(0, 10).filter(b => b.totalRatings > 0);

  const chartData = top10Books.map(book => ({
    name: book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title,
    rating: parseFloat(book.averageRating.toFixed(1)),
    count: book.totalRatings,
  }));

  const COLORS = ['#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6'];

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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {statsTitle}
              </h1>
            </div>
            <p className="text-muted-foreground">{statsDesc}</p>
          </div>

          {top10Books.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <div className="bg-muted/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold text-foreground mb-2">{noDataText}</p>
                <p className="text-muted-foreground">
                  {language === 'en' ? 'Users need to rate books first' : language === 'ru' ? 'Пользователи должны сначала оценить книги' : 'Avval foydalanuvchilar kitoblarni baholashlari kerak'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      {ratingsChartTitle}
                    </CardTitle>
                    <CardDescription>
                      {language === 'en' ? 'Top 10 books by rating' : language === 'ru' ? 'Топ 10 книг по рейтингу' : 'Reyting bo\'yicha top 10 kitob'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 5]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Bar dataKey="rating" fill="#fbbf24" name={avgRatingText} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      {totalRatingsTitle}
                    </CardTitle>
                    <CardDescription>
                      {language === 'en' ? 'Distribution of ratings' : language === 'ru' ? 'Распределение оценок' : 'Baholarning taqsimlanishi'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, count }) => `${count}`}
                          outerRadius={80}
                          fill="#fbbf24"
                          dataKey="count"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Top Rated Books List */}
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    {topRatedTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {booksWithRatings.slice(0, 10).map((book, index) => (
                      <Link key={book.id} to={`/book/${book.id}`}>
                        <div className="flex items-center gap-4 p-4 rounded-xl border-2 hover:border-primary hover:bg-accent/50 transition-all cursor-pointer group">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-primary/20 text-primary'
                          }`}>
                            {index + 1}
                          </div>
                          
                          {book.coverImageUrl && (
                            <div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-muted">
                              <img
                                src={book.coverImageUrl}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                              {book.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                            <Badge variant="outline" className="mt-1">
                              {getCategoryLabel(book.category)}
                            </Badge>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <div className="flex items-center gap-1 mb-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= book.averageRating
                                      ? 'fill-primary text-primary'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-lg font-bold text-primary">
                              {book.averageRating > 0 ? book.averageRating.toFixed(1) : '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {book.totalRatings} {totalText}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
