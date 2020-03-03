import { startServer } from './startServer';
import { logger } from './utils/logger';

startServer().then(() => {
    logger.info(`🚀 Server is running on ${process.env.API_BASE} 🚀`);
});
