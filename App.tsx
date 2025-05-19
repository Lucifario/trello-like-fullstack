import Board from './board';
import Header from './header';
import './basecs.css';
import './modal.css';

export default function App() {
  return (
    <div className="bg-[#181824] text-[#e0e0e0] font-sans min-h-screen">
      <Header />
      <div className="p-5">
        <Board />
      </div>
    </div>
    );
  }