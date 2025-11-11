import HomePage from '../pages/home/home-page';
import ListStoryPage from '../pages/liststory/liststory-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import NewStoryPage from '../pages/newstory/newstory-page';
import DetailPage from '../pages/details/details-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';

const routes = {
  '/': HomePage,
  '/details/:id': DetailPage,
  '/list': ListStoryPage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/add-story': NewStoryPage,
  '/bookmarks': BookmarkPage,
};

export default routes;
