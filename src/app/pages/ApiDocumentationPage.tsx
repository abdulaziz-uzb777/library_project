import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Code, BookOpen, Server, Key, Shield } from 'lucide-react';
import Footer from '../components/Footer';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function ApiDocumentationPage() {
  const { t, language } = useLanguage();

  const backText = language === 'en' ? 'Back' : language === 'ru' ? 'Назад' : 'Orqaga';
  const apiTitle = language === 'en' ? 'API Documentation' : language === 'ru' ? 'Документация API' : 'API hujjatlari';
  const apiDesc = language === 'en' 
    ? 'Learn about our API endpoints and integration' 
    : language === 'ru' 
    ? 'Узнайте о наших API эндпоинтах и интеграции' 
    : 'API endpointlari va integratsiya haqida ma\'lumot';

  const overviewTitle = language === 'en' ? 'Overview' : language === 'ru' ? 'Обзор' : 'Umumiy ko\'rinish';
  const overviewText = language === 'en'
    ? 'This library is powered by Supabase, a scalable and reliable backend-as-a-service platform. Our API provides access to book data, user authentication, and rating systems.'
    : language === 'ru'
    ? 'Эта библиотека работает на Supabase - масштабируемой и надежной платформе backend-as-a-service. Наш API предоставляет доступ к данным о книгах, аутентификации пользователей и системам рейтинга.'
    : 'Ushbu kutubxona Supabase tomonidan quvvatlanadi - kengaytiriladigan va ishonchli backend-as-a-service platformasi. Bizning API kitoblar ma\'lumotlari, foydalanuvchi autentifikatsiyasi va reyting tizimlariga kirish imkonini beradi.';

  const baseUrlTitle = language === 'en' ? 'Base URL' : language === 'ru' ? 'Базовый URL' : 'Asosiy URL';
  const authTitle = language === 'en' ? 'Authentication' : language === 'ru' ? 'Аутентификация' : 'Autentifikatsiya';
  const authText = language === 'en'
    ? 'All API requests require authentication using Supabase access tokens. Include the token in the Authorization header.'
    : language === 'ru'
    ? 'Все API запросы требуют аутентификации с использованием токенов доступа Supabase. Включите токен в заголовок Authorization.'
    : 'Barcha API so\'rovlari Supabase kirish tokenlari yordamida autentifikatsiyani talab qiladi. Tokenni Authorization sarlavhasiga qo\'shing.';

  const endpointsTitle = language === 'en' ? 'Available Endpoints' : language === 'ru' ? 'Доступные эндпоинты' : 'Mavjud endpointlar';
  
  const booksTitle = language === 'en' ? 'Books' : language === 'ru' ? 'Книги' : 'Kitoblar';
  const usersTitle = language === 'en' ? 'Users' : language === 'ru' ? 'Пользователи' : 'Foydalanuvchilar';
  const ratingsTitle = language === 'en' ? 'Ratings' : language === 'ru' ? 'Рейтинги' : 'Reytinglar';
  const commentsTitle = language === 'en' ? 'Comments' : language === 'ru' ? 'Комментарии' : 'Izohlar';

  const techStackTitle = language === 'en' ? 'Technology Stack' : language === 'ru' ? 'Технологический стек' : 'Texnologiya steki';

  const supabaseUrl = `https://${projectId}.supabase.co`;

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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Code className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {apiTitle}
              </h1>
            </div>
            <p className="text-muted-foreground">{apiDesc}</p>
          </div>

          {/* Overview */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {overviewTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{overviewText}</p>
            </CardContent>
          </Card>

          {/* Base URL */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                {baseUrlTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-accent/50 p-4 rounded-lg border-2 border-accent font-mono text-sm">
                {supabaseUrl}/functions/v1/make-server-58aa32b3
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {language === 'en' 
                  ? 'All API endpoints are prefixed with this base URL.' 
                  : language === 'ru' 
                  ? 'Все API эндпоинты имеют этот базовый URL в качестве префикса.' 
                  : 'Barcha API endpointlari ushbu asosiy URL bilan boshlanadi.'}
              </p>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {authTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">{authText}</p>
              
              <div>
                <p className="text-sm font-semibold mb-2">
                  {language === 'en' ? 'Public Anon Key:' : language === 'ru' ? 'Публичный ключ:' : 'Ommaviy kalit:'}
                </p>
                <div className="bg-accent/50 p-3 rounded-lg border-2 border-accent font-mono text-xs break-all">
                  {publicAnonKey}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">
                  {language === 'en' ? 'Example Header:' : language === 'ru' ? 'Пример заголовка:' : 'Sarlavha misoli:'}
                </p>
                <div className="bg-accent/50 p-3 rounded-lg border-2 border-accent font-mono text-sm">
                  Authorization: Bearer {'{access_token}'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                {endpointsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Books Endpoints */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {booksTitle}
                  </Badge>
                </h3>
                <div className="space-y-3 ml-4">
                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">GET</Badge>
                      <code className="text-sm font-mono">/books</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Get all books' : language === 'ru' ? 'Получить все книги' : 'Barcha kitoblarni olish'}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">GET</Badge>
                      <code className="text-sm font-mono">/books/{'{id}'}</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Get book by ID' : language === 'ru' ? 'Получить книгу по ID' : 'ID bo\'yicha kitobni olish'}
                    </p>
                  </div>

                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-500">POST</Badge>
                      <code className="text-sm font-mono">/books</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Create new book (Admin only)' : language === 'ru' ? 'Создать новую книгу (Только админ)' : 'Yangi kitob yaratish (Faqat admin)'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Users Endpoints */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {usersTitle}
                  </Badge>
                </h3>
                <div className="space-y-3 ml-4">
                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-500">POST</Badge>
                      <code className="text-sm font-mono">/auth/signup</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Register new user' : language === 'ru' ? 'Регистрация нового пользователя' : 'Yangi foydalanuvchini ro\'yxatdan o\'tkazish'}
                    </p>
                  </div>

                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-500">POST</Badge>
                      <code className="text-sm font-mono">/auth/signin</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'User login' : language === 'ru' ? 'Вход пользователя' : 'Foydalanuvchi kirishi'}
                    </p>
                  </div>

                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">GET</Badge>
                      <code className="text-sm font-mono">/auth/me</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Get current user' : language === 'ru' ? 'Получить текущего пользователя' : 'Joriy foydalanuvchini olish'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Ratings Endpoints */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {ratingsTitle}
                  </Badge>
                </h3>
                <div className="space-y-3 ml-4">
                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-500">POST</Badge>
                      <code className="text-sm font-mono">/ratings</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Rate a book (1-5 stars)' : language === 'ru' ? 'Оценить книгу (1-5 звезд)' : 'Kitobni baholash (1-5 yulduz)'}
                    </p>
                  </div>

                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">GET</Badge>
                      <code className="text-sm font-mono">/ratings/{'{bookId}'}</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Get book ratings' : language === 'ru' ? 'Получить рейтинги книги' : 'Kitob reytinglarini olish'}
                    </p>
                  </div>

                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">GET</Badge>
                      <code className="text-sm font-mono">/ratings</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Get all ratings statistics' : language === 'ru' ? 'Получить статистику всех рейтингов' : 'Barcha reytinglar statistikasini olish'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Comments Endpoints */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {commentsTitle}
                  </Badge>
                </h3>
                <div className="space-y-3 ml-4">
                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">GET</Badge>
                      <code className="text-sm font-mono">/comments/{'{bookId}'}</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Get book comments' : language === 'ru' ? 'Получить комментарии книги' : 'Kitob izohlarini olish'}
                    </p>
                  </div>

                  <div className="p-3 bg-accent/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-500">POST</Badge>
                      <code className="text-sm font-mono">/comments</code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Add comment to book' : language === 'ru' ? 'Добавить комментарий к книге' : 'Kitobga izoh qo\'shish'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle>{techStackTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-accent/30 rounded-lg border text-center">
                  <p className="font-semibold">React</p>
                  <p className="text-xs text-muted-foreground mt-1">Frontend</p>
                </div>
                <div className="p-4 bg-accent/30 rounded-lg border text-center">
                  <p className="font-semibold">Supabase</p>
                  <p className="text-xs text-muted-foreground mt-1">Backend</p>
                </div>
                <div className="p-4 bg-accent/30 rounded-lg border text-center">
                  <p className="font-semibold">TypeScript</p>
                  <p className="text-xs text-muted-foreground mt-1">Language</p>
                </div>
                <div className="p-4 bg-accent/30 rounded-lg border text-center">
                  <p className="font-semibold">Tailwind CSS</p>
                  <p className="text-xs text-muted-foreground mt-1">Styling</p>
                </div>
                <div className="p-4 bg-accent/30 rounded-lg border text-center">
                  <p className="font-semibold">Hono</p>
                  <p className="text-xs text-muted-foreground mt-1">API Server</p>
                </div>
                <div className="p-4 bg-accent/30 rounded-lg border text-center">
                  <p className="font-semibold">Deno</p>
                  <p className="text-xs text-muted-foreground mt-1">Runtime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
