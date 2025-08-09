// TypeScript validation file - force language server refresh
import './middleware/auth';
import './middleware/errorHandler';
import './middleware/requestLogger';
import './routes/auth';
import './routes/users';
import './routes/audits';
import './routes/findings';
import './routes/risks';
import './routes/actions';
import './routes/compliance';
import './routes/analytics';
import './routes/documents';
import './routes/notifications';

// This file exists only to force TypeScript to validate all imports
// Delete this file after VS Code resolves the module issues
console.log('All modules imported successfully');
