import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Upload, FileText, Image } from 'lucide-react';
import type { Book } from '../../utils/api';

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

interface EditBookDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (bookData: {
    title: string;
    author: string;
    description: string;
    summary: string;
    category: string;
    pdfFile?: File;
    coverImageFile?: File;
  }) => Promise<void>;
}

export default function EditBookDialog({ book, open, onOpenChange, onSave }: EditBookDialogProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setDescription(book.description);
      setSummary(book.summary);
      setCategory(book.category);
      setCoverImagePreview(book.coverImageUrl || null);
      setPdfFile(null);
      setCoverImageFile(null);
    }
  }, [book]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Размер изображения не должен превышать 2MB');
        return;
      }
      
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(book?.coverImageUrl || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        title,
        author,
        description,
        summary,
        category,
        pdfFile: pdfFile || undefined,
        coverImageFile: coverImageFile || undefined,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating book:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать книгу</DialogTitle>
          <DialogDescription>
            Измените информацию о книге и нажмите "Сохранить"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-title">Название книги *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-author">Автор *</Label>
              <Input
                id="edit-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-category">Категория *</Label>
            <Select value={category} onValueChange={setCategory} required>
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
            <Label htmlFor="edit-description">Описание *</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="edit-summary">Краткое содержание *</Label>
            <Textarea
              id="edit-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="edit-pdf">PDF файл (оставьте пустым, чтобы не изменять)</Label>
            <Input
              id="edit-pdf"
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
            {book?.pdfUrl && !pdfFile && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Текущий PDF файл загружен</span>
              </div>
            )}
            {pdfFile && (
              <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                <FileText className="h-4 w-4" />
                <span>Новый файл: {pdfFile.name}</span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-coverImage">Обложка книги (соотношение 2:3, опционально)</Label>
            <Input
              id="edit-coverImage"
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
            />
            {coverImagePreview && (
              <div className="mt-3 relative inline-block">
                <div className="aspect-[2/3] w-40 overflow-hidden rounded-lg border-2 border-primary">
                  <img
                    src={coverImagePreview}
                    alt="Предпросмотр обложки"
                    className="w-full h-full object-cover"
                  />
                </div>
                {coverImageFile && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={handleRemoveCoverImage}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Отменить изменение
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
