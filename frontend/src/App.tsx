import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import Archive from './pages/Archive';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/lesson/:day" element={<Lesson />} />
        <Route path="/quiz/:day" element={<Quiz />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
