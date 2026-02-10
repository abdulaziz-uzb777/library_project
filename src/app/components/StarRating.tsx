import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  isSubmitting?: boolean;
}

export default function StarRating({ rating, onRate, isSubmitting = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const { t, language } = useLanguage();

  const handleClick = (newRating: number) => {
    if (!isSubmitting) {
      onRate(newRating);
    }
  };

  const handleMouseEnter = (newRating: number) => {
    if (!isSubmitting) {
      setHoverValue(newRating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const displayValue = hoverValue || rating;

  const rateText = language === 'en' ? 'Rate this book' : language === 'ru' ? 'Оцените эту книгу' : 'Ushbu kitobni baholang';
  const yourRatingText = language === 'en' ? 'Your rating' : language === 'ru' ? 'Ваша оценка' : 'Sizning bahongiz';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">{rating > 0 ? yourRatingText : rateText}</h3>
        <div className="flex items-center gap-3" onMouseLeave={handleMouseLeave}>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleClick(star)}
                onMouseEnter={() => handleMouseEnter(star)}
                disabled={isSubmitting}
                className={`transition-all ${
                  isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-125'
                }`}
              >
                <Star
                  className={`h-8 w-8 transition-all duration-200 ${
                    star <= displayValue
                      ? 'fill-primary text-primary scale-110'
                      : 'text-muted-foreground hover:text-primary/50'
                  }`}
                />
              </button>
            ))}
          </div>
          {displayValue > 0 && (
            <span className="text-2xl font-bold text-primary">
              {displayValue}/5
            </span>
          )}
        </div>
        {rating > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'en' && 'Click to change your rating'}
            {language === 'ru' && 'Нажмите, чтобы изменить оценку'}
            {language === 'uz' && 'Bahoni o\'zgartirish uchun bosing'}
          </p>
        )}
      </div>
    </div>
  );
}
