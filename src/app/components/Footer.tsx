import { Phone, Send, MessageCircle, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { submitFeedback } from '../../utils/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t, language } = useLanguage();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitFeedback({ name, email, message });
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      
      setTimeout(() => {
        setFeedbackOpen(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const msg = language === 'en' ? 'Error submitting feedback. Please try again.' :
                  language === 'ru' ? 'Ошибка при отправке отзыва. Попробуйте еще раз.' :
                  'Fikr yuborishda xato. Qaytadan urinib ko\'ring.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const libraryDesc = language === 'en' ? 'Online library for reading books' :
                      language === 'ru' ? 'Онлайн библиотека для чтения книг' :
                      'Kitob o\'qish uchun onlayn kutubxona';
  const contactsText = language === 'en' ? 'Contacts' : language === 'ru' ? 'Контакты' : 'Kontaktlar';
  const feedbackSectionText = language === 'en' ? 'Feedback' : language === 'ru' ? 'Обратная связь' : 'Fikr-mulohaza';
  const feedbackDialogDesc = language === 'en' 
    ? 'We value your opinion! Tell us what you think about our library.' 
    : language === 'ru' 
    ? 'Мы ценим ваше мнение! Расскажите нам, что вы думаете о нашей библиотеке.' 
    : 'Sizning fikringizni qadrlaymiz! Kutubxonamiz haqida nimani o\'ylaysiz, bizga ayting.';
  const thankYouText = language === 'en' ? '✓ Thank you for your feedback!' :
                       language === 'ru' ? '✓ Спасибо за отзыв!' :
                       '✓ Fikringiz uchun rahmat!';
  const importantText = language === 'en' ? 'Your opinion is very important to us.' :
                        language === 'ru' ? 'Ваше мнение очень важно для нас.' :
                        'Sizning fikringiz biz uchun juda muhim.';
  const feedbackHelpText = language === 'en' ? 'Your feedback helps us\nimprove' :
                           language === 'ru' ? 'Ваши отзывы помогают нам\nстать лучше' :
                           'Sizning fikrlaringiz bizga\nyaxshilanishga yordam beradi';

  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="bg-primary rounded-lg p-1.5">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{t('header.library')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {libraryDesc}
            </p>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col items-center gap-4">
            <h4 className="font-semibold text-sm">{contactsText}</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://t.me/abdulaziz_orders999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
              >
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary group-hover:shadow-lg transition-all">
                  <Send className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span>@abdulaziz_orders999</span>
              </a>

              <a
                href="tel:+998505070057"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
              >
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary group-hover:shadow-lg transition-all">
                  <Phone className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span>+998 (50) 507-00-57</span>
              </a>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="flex flex-col items-center gap-4">
            <h4 className="font-semibold text-sm">{feedbackSectionText}</h4>
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-2 hover:border-primary hover:bg-primary/10 shadow-sm">
                  <MessageCircle className="h-4 w-4" />
                  {t('footer.feedback')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{t('footer.feedback')}</DialogTitle>
                  <DialogDescription>
                    {feedbackDialogDesc}
                  </DialogDescription>
                </DialogHeader>

                {submitSuccess ? (
                  <div className="py-8 text-center">
                    <p className="text-lg font-semibold text-primary mb-2">{thankYouText}</p>
                    <p className="text-sm text-muted-foreground">{importantText}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t('footer.name')}</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder={language === 'en' ? 'Enter your name' : language === 'ru' ? 'Введите ваше имя' : 'Ismingizni kiriting'}
                        className="border-2 focus:border-primary"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">{t('footer.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="example@email.com"
                        className="border-2 focus:border-primary"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">{t('footer.message')}</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        placeholder={language === 'en' ? 'Share your thoughts...' : language === 'ru' ? 'Поделитесь вашими мыслями...' : 'O\'ylaringizni baham ko\'ring...'}
                        className="min-h-[120px] border-2 focus:border-primary"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setFeedbackOpen(false)}
                        disabled={isSubmitting}
                        className="border-2"
                      >
                        {t('footer.cancel')}
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="shadow-md">
                        {isSubmitting 
                          ? (language === 'en' ? 'Sending...' : language === 'ru' ? 'Отправка...' : 'Yuborilmoqda...') 
                          : t('footer.send')}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
            <p className="text-xs text-muted-foreground text-center whitespace-pre-line">
              {feedbackHelpText}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {t('header.library')}. {t('footer.allRights')}.</p>
        </div>
      </div>
    </footer>
  );
}
