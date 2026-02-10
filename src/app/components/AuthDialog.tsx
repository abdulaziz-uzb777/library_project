import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { signup, signin, getCurrentUser } from '../../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign in state
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');

  // Sign up state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { accessToken } = await signin(loginValue, password);
      const { user } = await getCurrentUser(accessToken);
      login(accessToken, user);
      toast.success(t('auth.loginSuccess'));
      onOpenChange(false);
      setLoginValue('');
      setPassword('');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !dateOfBirth || !country || !city || !signupPassword) {
      const msg = language === 'en' ? 'Fill in all required fields' : 
                  language === 'ru' ? 'Заполните все обязательные поля' : 
                  'Barcha majburiy maydonlarni to\'ldiring';
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const { login: generatedLogin, password: generatedPassword } = await signup({
        firstName,
        lastName,
        dateOfBirth,
        country,
        city,
        aboutMe,
        password: signupPassword,
      });

      const successMsg = language === 'en' ? 'Account created!' : 
                        language === 'ru' ? 'Аккаунт создан!' : 
                        'Akkount yaratildi!';
      const loginLabel = language === 'en' ? 'Login:' : 
                        language === 'ru' ? 'Логин:' : 
                        'Login:';
      const useLoginMsg = language === 'en' ? 'Use this login to sign in' : 
                         language === 'ru' ? 'Используйте этот логин для входа' : 
                         'Kirish uchun ushbu logindan foydalaning';

      toast.success(
        <div>
          <p>{successMsg}</p>
          <p className="text-sm mt-1">{loginLabel} <strong>{generatedLogin}</strong></p>
          <p className="text-sm">{useLoginMsg}</p>
        </div>,
        { duration: 8000 }
      );

      // Auto sign in
      const { accessToken } = await signin(generatedLogin, generatedPassword);
      const { user } = await getCurrentUser(accessToken);
      login(accessToken, user);
      
      onOpenChange(false);
      
      // Reset form
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setCountry('');
      setCity('');
      setAboutMe('');
      setSignupPassword('');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || t('auth.registerFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const infoText = language === 'en' ? '💡 First time here? Go to "Register" tab to create an account.' :
                   language === 'ru' ? '💡 Впервые здесь? Перейдите на вкладку "Регистрация" для создания аккаунта.' :
                   '💡 Birinchi marta keldingizmi? Akkount yaratish uchun "Ro\'yxatdan o\'tish" bo\'limiga o\'ting.';

  const dialogDesc = language === 'en' ? 'Sign in to your account or create a new one' :
                     language === 'ru' ? 'Войдите в свой аккаунт или создайте новый' :
                     'Akkauntingizga kiring yoki yangisini yarating';

  const afterRegText = language === 'en' ? 'After registration, you will be given a unique login' :
                       language === 'ru' ? 'После регистрации вам будет сгенерирован уникальный логин' :
                       'Ro\'yxatdan o\'tgandan so\'ng sizga noyob login beriladi';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t('auth.title')}</DialogTitle>
          <DialogDescription>
            {dialogDesc}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" className="gap-2">
              <LogIn className="h-4 w-4" />
              {t('auth.loginButton')}
            </TabsTrigger>
            <TabsTrigger value="signup" className="gap-2">
              <UserPlus className="h-4 w-4" />
              {t('auth.registerButton')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <div className="mb-4 p-3 bg-primary/10 border-2 border-primary/30 rounded-lg">
              <p className="text-sm text-foreground">
                {infoText}
              </p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="login">{t('auth.username')}</Label>
                <Input
                  id="login"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  placeholder={language === 'en' ? 'Enter login' : language === 'ru' ? 'Введите логин' : 'Loginni kiriting'}
                  required
                  className="border-2 focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'en' ? 'Enter password' : language === 'ru' ? 'Введите пароль' : 'Parolni kiriting'}
                  required
                  className="border-2 focus:border-primary"
                />
              </div>
              <Button type="submit" className="w-full shadow-lg" disabled={isLoading}>
                {isLoading 
                  ? (language === 'en' ? 'Signing in...' : language === 'ru' ? 'Вход...' : 'Kirish...')
                  : t('auth.loginButton')}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t('auth.firstName')} *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={language === 'en' ? 'Your name' : language === 'ru' ? 'Ваше имя' : 'Ismingiz'}
                    required
                    className="border-2 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t('auth.lastName')} *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={language === 'en' ? 'Your surname' : language === 'ru' ? 'Ваша фамилия' : 'Familiyangiz'}
                    required
                    className="border-2 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">
                  {language === 'en' ? 'Date of Birth *' : language === 'ru' ? 'Дата рождения *' : 'Tug\'ilgan kun *'}
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="border-2 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">
                    {language === 'en' ? 'Country *' : language === 'ru' ? 'Страна *' : 'Mamlakat *'}
                  </Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={language === 'en' ? 'Your country' : language === 'ru' ? 'Ваша страна' : 'Mamlakatinig'}
                    required
                    className="border-2 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="city">
                    {language === 'en' ? 'City *' : language === 'ru' ? 'Город *' : 'Shahar *'}
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={language === 'en' ? 'Your city' : language === 'ru' ? 'Ваш город' : 'Shaharingiz'}
                    required
                    className="border-2 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="aboutMe">
                  {language === 'en' ? 'About Me' : language === 'ru' ? 'О себе' : 'O\'zingiz haqingizda'}
                </Label>
                <Textarea
                  id="aboutMe"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder={language === 'en' ? 'Tell us about yourself (optional)' : language === 'ru' ? 'Расскажите о себе (необязательно)' : 'O\'zingiz haqingizda (majburiy emas)'}
                  rows={3}
                  className="border-2 focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="signupPassword">{t('auth.password')} *</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder={language === 'en' ? 'Create a password' : language === 'ru' ? 'Придумайте пароль' : 'Parol yarating'}
                  required
                  className="border-2 focus:border-primary"
                />
              </div>
              <Button type="submit" className="w-full shadow-lg" disabled={isLoading}>
                {isLoading 
                  ? (language === 'en' ? 'Creating...' : language === 'ru' ? 'Создание...' : 'Yaratilmoqda...')
                  : (language === 'en' ? 'Create Account' : language === 'ru' ? 'Создать аккаунт' : 'Akkount yaratish')}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {afterRegText}
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
