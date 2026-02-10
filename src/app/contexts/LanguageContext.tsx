import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru' | 'uz';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.library': 'Library',
    'header.login': 'Login',
    'header.logout': 'Logout',
    'header.profile': 'Profile',
    'header.home': 'Home',
    'header.statistics': 'Statistics',
    'header.api': 'API',
    
    // Categories
    'category.all': 'All',
    'category.novel': 'Novel',
    'category.scifi': 'Science Fiction',
    'category.fantasy': 'Fantasy',
    'category.detective': 'Detective',
    'category.romance': 'Romance',
    'category.adventure': 'Adventure',
    'category.popular': 'Popular Science',
    'category.selfdevelopment': 'Self Development',
    
    // Home Page
    'home.search': 'Search books by title or author...',
    'home.categories': 'Categories',
    'home.closeCategories': 'Close',
    'home.noBooks': 'No books found',
    'home.loading': 'Loading...',
    'home.download': 'Download',
    'home.readMore': 'Read More',
    
    // Auth Dialog
    'auth.title': 'Login',
    'auth.registerTitle': 'Registration',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Register',
    'auth.switchToRegister': 'Don\'t have an account? Register',
    'auth.switchToLogin': 'Already have an account? Login',
    'auth.loginSuccess': 'Successfully logged in!',
    'auth.registerSuccess': 'Registration successful!',
    'auth.loginFailed': 'Login failed',
    'auth.registerFailed': 'Registration failed',
    'auth.yourCredentials': 'Your credentials',
    'auth.saveCredentials': 'Please save your credentials:',
    
    // Profile Page
    'profile.title': 'Profile',
    'profile.favorites': 'Favorites',
    'profile.recent': 'Recently Viewed',
    'profile.noFavorites': 'No favorite books yet',
    'profile.noRecent': 'No recently viewed books',
    'profile.addToFavorites': 'Add books to favorites to see them here',
    'profile.viewBooks': 'View books to see them here',
    
    // Book Detail
    'book.details': 'Book Details',
    'book.author': 'Author',
    'book.category': 'Category',
    'book.description': 'Description',
    'book.download': 'Download PDF',
    'book.addToFavorites': 'Add to Favorites',
    'book.removeFromFavorites': 'Remove from Favorites',
    'book.addedToFavorites': 'Added to favorites',
    'book.removedFromFavorites': 'Removed from favorites',
    'book.comments': 'Comments',
    'book.noComments': 'No comments yet',
    'book.beFirst': 'Be the first to comment!',
    'book.writeComment': 'Write a comment...',
    'book.postComment': 'Post Comment',
    'book.deleteComment': 'Delete',
    'book.commentPosted': 'Comment posted!',
    'book.commentDeleted': 'Comment deleted',
    'book.loginToComment': 'Please login to comment',
    'book.rating': 'Rating',
    'book.loginToRate': 'Please login to rate this book',
    'book.ratingSubmitted': 'Rating submitted successfully!',
    
    // Footer
    'footer.feedback': 'Send Feedback',
    'footer.name': 'Your Name',
    'footer.email': 'Your Email',
    'footer.message': 'Your Message',
    'footer.send': 'Send',
    'footer.cancel': 'Cancel',
    'footer.thankYou': 'Thank you for your feedback!',
    'footer.feedbackFailed': 'Failed to send feedback',
    'footer.allRights': 'All rights reserved',
    
    // Admin Panel
    'admin.title': 'Admin Panel',
    'admin.addBook': 'Add New Book',
    'admin.books': 'Books',
    'admin.comments': 'Comments',
    'admin.feedback': 'Feedback',
    'admin.logout': 'Logout',
    'admin.login': 'Admin Login',
    'admin.password': 'Password',
    'admin.loginButton': 'Login',
    'admin.unauthorized': 'Unauthorized',
    'admin.loginSuccess': 'Login successful',
    'admin.loginFailed': 'Invalid password',
    
    // Common
    'common.close': 'Close',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  ru: {
    // Header
    'header.library': 'Библиотека',
    'header.login': 'Войти',
    'header.logout': 'Выйти',
    'header.profile': 'Профиль',
    'header.home': 'Главная',
    'header.statistics': 'Статистика',
    'header.api': 'API',
    
    // Categories
    'category.all': 'Все',
    'category.novel': 'Роман',
    'category.scifi': 'Фантастика',
    'category.fantasy': 'Фэнтези',
    'category.detective': 'Детектив',
    'category.romance': 'Любовный роман',
    'category.adventure': 'Приключения',
    'category.popular': 'Научно-популярная литература',
    'category.selfdevelopment': 'Саморазвитие',
    
    // Home Page
    'home.search': 'Поиск по названию или автору...',
    'home.categories': 'Категории',
    'home.closeCategories': 'Закрыть',
    'home.noBooks': 'Книги не найдены',
    'home.loading': 'Загрузка...',
    'home.download': 'Скачать',
    'home.readMore': 'Подробнее',
    
    // Auth Dialog
    'auth.title': 'Вход',
    'auth.registerTitle': 'Регистрация',
    'auth.username': 'Логин',
    'auth.password': 'Пароль',
    'auth.firstName': 'Имя',
    'auth.lastName': 'Фамилия',
    'auth.loginButton': 'Войти',
    'auth.registerButton': 'Зарегистрироваться',
    'auth.switchToRegister': 'Нет аккаунта? Зарегистрируйтесь',
    'auth.switchToLogin': 'Уже есть аккаунт? Войдите',
    'auth.loginSuccess': 'Вход выполнен успешно!',
    'auth.registerSuccess': 'Регистрация прошла успешно!',
    'auth.loginFailed': 'Ошибка входа',
    'auth.registerFailed': 'Ошибка регистрации',
    'auth.yourCredentials': 'Ваши данные для входа',
    'auth.saveCredentials': 'Пожалуйста, сохраните ваши данные:',
    
    // Profile Page
    'profile.title': 'Профиль',
    'profile.favorites': 'Избранное',
    'profile.recent': 'Недавние',
    'profile.noFavorites': 'Нет избранных книг',
    'profile.noRecent': 'Нет недавно просмотренных книг',
    'profile.addToFavorites': 'Добавьте книги в избранное, чтобы видеть их здесь',
    'profile.viewBooks': 'Просматривайте книги, чтобы видеть их здесь',
    
    // Book Detail
    'book.details': 'Детали книги',
    'book.author': 'Автор',
    'book.category': 'Категория',
    'book.description': 'Описание',
    'book.download': 'Скачать PDF',
    'book.addToFavorites': 'Добавить в избранное',
    'book.removeFromFavorites': 'Удалить из избранного',
    'book.addedToFavorites': 'Добавлено в избранное',
    'book.removedFromFavorites': 'Удалено из избранного',
    'book.comments': 'Комментарии',
    'book.noComments': 'Пока нет комментариев',
    'book.beFirst': 'Станьте первым, кто оставит комментарий!',
    'book.writeComment': 'Написать комментарий...',
    'book.postComment': 'Отправить',
    'book.deleteComment': 'Удалить',
    'book.commentPosted': 'Комментарий опубликован!',
    'book.commentDeleted': 'Комментарий удален',
    'book.loginToComment': 'Войдите, чтобы оставить комментарий',
    'book.rating': 'Рейтинг',
    'book.loginToRate': 'Войдите, чтобы оценить эту книгу',
    'book.ratingSubmitted': 'Рейтинг успешно отправлен!',
    
    // Footer
    'footer.feedback': 'Оставить отзыв',
    'footer.name': 'Ваше имя',
    'footer.email': 'Ваш Email',
    'footer.message': 'Ваше сообщение',
    'footer.send': 'Отправить',
    'footer.cancel': 'Отмена',
    'footer.thankYou': 'Спасибо за ваш отзыв!',
    'footer.feedbackFailed': 'Не удалось отправить отзыв',
    'footer.allRights': 'Все права защищены',
    
    // Admin Panel
    'admin.title': 'Панель администратора',
    'admin.addBook': 'Добавить книгу',
    'admin.books': 'Книги',
    'admin.comments': 'Комментарии',
    'admin.feedback': 'Отзывы',
    'admin.logout': 'Выйти',
    'admin.login': 'Вход администратора',
    'admin.password': 'Пароль',
    'admin.loginButton': 'Войти',
    'admin.unauthorized': 'Доступ запрещен',
    'admin.loginSuccess': 'Вход выполнен',
    'admin.loginFailed': 'Неверный пароль',
    
    // Common
    'common.close': 'Закрыть',
    'common.save': 'Сохранить',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.cancel': 'Отмена',
    'common.confirm': 'Подтвердить',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
  },
  uz: {
    // Header
    'header.library': 'Kutubxona',
    'header.login': 'Kirish',
    'header.logout': 'Chiqish',
    'header.profile': 'Profil',
    'header.home': 'Bosh sahifa',
    'header.statistics': 'Statistika',
    'header.api': 'API',
    
    // Categories
    'category.all': 'Hammasi',
    'category.novel': 'Roman',
    'category.scifi': 'Fantastika',
    'category.fantasy': 'Fantezi',
    'category.detective': 'Detektiv',
    'category.romance': 'Sevgi romani',
    'category.adventure': 'Sarguzasht',
    'category.popular': 'Ilmiy-ommabop adabiyot',
    'category.selfdevelopment': 'O\'z-o\'zini rivojlantirish',
    
    // Home Page
    'home.search': 'Kitob nomi yoki muallif bo\'yicha qidirish...',
    'home.categories': 'Kategoriyalar',
    'home.closeCategories': 'Yopish',
    'home.noBooks': 'Kitoblar topilmadi',
    'home.loading': 'Yuklanmoqda...',
    'home.download': 'Yuklab olish',
    'home.readMore': 'Batafsil',
    
    // Auth Dialog
    'auth.title': 'Kirish',
    'auth.registerTitle': 'Ro\'yxatdan o\'tish',
    'auth.username': 'Login',
    'auth.password': 'Parol',
    'auth.firstName': 'Ism',
    'auth.lastName': 'Familiya',
    'auth.loginButton': 'Kirish',
    'auth.registerButton': 'Ro\'yxatdan o\'tish',
    'auth.switchToRegister': 'Akkauntingiz yo\'qmi? Ro\'yxatdan o\'ting',
    'auth.switchToLogin': 'Akkauntingiz bormi? Kiring',
    'auth.loginSuccess': 'Muvaffaqiyatli kirildi!',
    'auth.registerSuccess': 'Ro\'yxatdan o\'tish muvaffaqiyatli!',
    'auth.loginFailed': 'Kirish xatosi',
    'auth.registerFailed': 'Ro\'yxatdan o\'tish xatosi',
    'auth.yourCredentials': 'Sizning ma\'lumotlaringiz',
    'auth.saveCredentials': 'Iltimos, ma\'lumotlaringizni saqlang:',
    
    // Profile Page
    'profile.title': 'Profil',
    'profile.favorites': 'Sevimlilar',
    'profile.recent': 'Yaqinda ko\'rilgan',
    'profile.noFavorites': 'Sevimli kitoblar yo\'q',
    'profile.noRecent': 'Yaqinda ko\'rilgan kitoblar yo\'q',
    'profile.addToFavorites': 'Kitoblarni sevimlilarga qo\'shing',
    'profile.viewBooks': 'Kitoblarni ko\'ring',
    
    // Book Detail
    'book.details': 'Kitob haqida',
    'book.author': 'Muallif',
    'book.category': 'Kategoriya',
    'book.description': 'Tavsif',
    'book.download': 'PDF yuklab olish',
    'book.addToFavorites': 'Sevimlilarga qo\'shish',
    'book.removeFromFavorites': 'Sevimlilardan o\'chirish',
    'book.addedToFavorites': 'Sevimlilarga qo\'shildi',
    'book.removedFromFavorites': 'Sevimlilardan o\'chirildi',
    'book.comments': 'Izohlar',
    'book.noComments': 'Hali izohlar yo\'q',
    'book.beFirst': 'Birinchi bo\'lib izoh qoldiring!',
    'book.writeComment': 'Izoh yozish...',
    'book.postComment': 'Yuborish',
    'book.deleteComment': 'O\'chirish',
    'book.commentPosted': 'Izoh yuborildi!',
    'book.commentDeleted': 'Izoh o\'chirildi',
    'book.loginToComment': 'Izoh qoldirish uchun kiring',
    'book.rating': 'Reyting',
    'book.loginToRate': 'Bu kitobni baholash uchun kiring',
    'book.ratingSubmitted': 'Reyting muvaffaqiyatli yuborildi!',
    
    // Footer
    'footer.feedback': 'Fikr bildirish',
    'footer.name': 'Ismingiz',
    'footer.email': 'Emailingiz',
    'footer.message': 'Xabaringiz',
    'footer.send': 'Yuborish',
    'footer.cancel': 'Bekor qilish',
    'footer.thankYou': 'Fikringiz uchun rahmat!',
    'footer.feedbackFailed': 'Fikr yuborib bo\'lmadi',
    'footer.allRights': 'Barcha huquqlar himoyalangan',
    
    // Admin Panel
    'admin.title': 'Admin panel',
    'admin.addBook': 'Kitob qo\'shish',
    'admin.books': 'Kitoblar',
    'admin.comments': 'Izohlar',
    'admin.feedback': 'Fikrlar',
    'admin.logout': 'Chiqish',
    'admin.login': 'Admin kirish',
    'admin.password': 'Parol',
    'admin.loginButton': 'Kirish',
    'admin.unauthorized': 'Ruxsat yo\'q',
    'admin.loginSuccess': 'Kirildi',
    'admin.loginFailed': 'Noto\'g\'ri parol',
    
    // Common
    'common.close': 'Yopish',
    'common.save': 'Saqlash',
    'common.delete': 'O\'chirish',
    'common.edit': 'Tahrirlash',
    'common.cancel': 'Bekor qilish',
    'common.confirm': 'Tasdiqlash',
    'common.loading': 'Yuklanmoqda...',
    'common.error': 'Xato',
    'common.success': 'Muvaffaqiyatli',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};