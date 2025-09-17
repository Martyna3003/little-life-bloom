export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' = 'medium',
    public context?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, context?: string): AppError => {
  // Log do konsoli dla development
  console.error(`[${context || 'App'}] Error:`, error);
  
  // Jeśli to już AppError, zwróć go
  if (error instanceof AppError) {
    return error;
  }
  
  // Jeśli to błąd Supabase, przekonwertuj
  if (error && typeof error === 'object' && 'code' in error) {
    return handleSupabaseError(error, context);
  }
  
  // Jeśli to standardowy Error, przekonwertuj
  if (error instanceof Error) {
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      'medium',
      { originalError: error, context }
    );
  }
  
  // Fallback dla nieznanych błędów
  return new AppError(
    'Wystąpił nieoczekiwany błąd',
    'UNKNOWN_ERROR',
    'medium',
    { originalError: error, context }
  );
};

export const handleSupabaseError = (error: any, operation?: string): AppError => {
  const context = operation ? `Supabase ${operation}` : 'Supabase';
  
  // Błędy autoryzacji
  if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
    return new AppError(
      'Sesja wygasła, zaloguj się ponownie',
      'SESSION_EXPIRED',
      'high',
      { originalError: error, context }
    );
  }
  
  // Błędy uprawnień
  if (error.code === '42501') {
    return new AppError(
      'Brak uprawnień do tej operacji',
      'PERMISSION_DENIED',
      'high',
      { originalError: error, context }
    );
  }
  
  // Brak danych
  if (error.code === 'PGRST116') {
    return new AppError(
      'Nie znaleziono danych',
      'NOT_FOUND',
      'medium',
      { originalError: error, context }
    );
  }
  
  // Konflikty danych
  if (error.code === '23505') {
    return new AppError(
      'Dane już istnieją',
      'DUPLICATE_DATA',
      'medium',
      { originalError: error, context }
    );
  }
  
  // Błędy sieciowe
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return new AppError(
      'Problem z połączeniem internetowym',
      'NETWORK_ERROR',
      'medium',
      { originalError: error, context }
    );
  }
  
  // Błędy walidacji
  if (error.code === '23514') {
    return new AppError(
      'Nieprawidłowe dane',
      'VALIDATION_ERROR',
      'medium',
      { originalError: error, context }
    );
  }
  
  // Fallback dla błędów Supabase
  return new AppError(
    error.message || 'Błąd bazy danych',
    'SUPABASE_ERROR',
    'medium',
    { originalError: error, context }
  );
};

export const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.code) {
    case 'SESSION_EXPIRED':
      return 'Twoja sesja wygasła. Zaloguj się ponownie, aby kontynuować.';
    case 'PERMISSION_DENIED':
      return 'Nie masz uprawnień do tej operacji. Skontaktuj się z administratorem.';
    case 'NOT_FOUND':
      return 'Nie znaleziono żądanych danych. Sprawdź czy wszystko jest w porządku.';
    case 'DUPLICATE_DATA':
      return 'Te dane już istnieją. Spróbuj z innymi wartościami.';
    case 'NETWORK_ERROR':
      return 'Problem z połączeniem internetowym. Sprawdź połączenie i spróbuj ponownie.';
    case 'VALIDATION_ERROR':
      return 'Wprowadzone dane są nieprawidłowe. Sprawdź i popraw błędy.';
    case 'SUPABASE_ERROR':
      return 'Wystąpił problem z bazą danych. Spróbuj ponownie za chwilę.';
    case 'UNKNOWN_ERROR':
      return 'Wystąpił nieoczekiwany błąd. Odśwież stronę i spróbuj ponownie.';
    default:
      return 'Coś poszło nie tak. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.';
  }
};
