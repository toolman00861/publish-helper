import { useState, useEffect } from 'react';
import { Settings, Eraser, Sparkles, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeContent } from './api';
import { AnalysisResult } from './types';
import { exportToTxt, exportToWord } from './utils/exportUtils';

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ZHIPU_API_KEY') || '');
  const [showSettings, setShowSettings] = useState(false);
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    localStorage.setItem('ZHIPU_API_KEY', apiKey);
  }, [apiKey]);

  const handleClear = () => {
    setTitle('');
    setText('');
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      setError('请先在右上角配置智谱 API Key');
      setShowSettings(true);
      return;
    }
    if (!text.trim()) {
      setError('请输入需要分析的内容');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await analyzeContent({ text, title, apiKey });
      setResult(res);
    } catch (err: any) {
      setError(err.message || '分析过程中发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  const renderResultMarkdown = () => {
    if (!result) return '';
    return `## ${result.title}

**分类：** ${result.type}
**热度分：** ${result.score}/10

### 核心摘要
${result.summary}

### 评分理由
${result.reason}
`;
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1 px-4">
          <a className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary" />
            事件分析助手
          </a>
        </div>
        <div className="flex-none">
          <button 
            className="btn btn-ghost btn-circle"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <main className="container mx-auto p-4 md:p-6 lg:max-w-6xl">
        {/* Settings Panel */}
        {showSettings && (
          <div className="card bg-base-100 shadow-md mb-6">
            <div className="card-body p-4 flex-row items-end gap-4">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">智谱 API Key (GLM-4)</span>
                </label>
                <input 
                  type="password" 
                  placeholder="输入您的 API Key..." 
                  className="input input-bordered w-full" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setShowSettings(false)}
              >
                保存配置
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Input */}
          <div className="card bg-base-100 shadow-xl h-fit">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">内容输入</h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">事件标题（可选）</span>
                </label>
                <input 
                  type="text" 
                  placeholder="留空则由 AI 自动生成" 
                  className="input input-bordered w-full" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">长文本内容 <span className="text-error">*</span></span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-64 font-sans text-base leading-relaxed" 
                  placeholder="粘贴微信/小红书/抖音等平台的文本内容..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
              </div>

              {error && (
                <div className="alert alert-error mt-4 p-3 rounded-lg text-sm">
                  <span>{error}</span>
                </div>
              )}

              <div className="card-actions justify-end mt-6">
                <button 
                  className="btn btn-ghost" 
                  onClick={handleClear}
                  disabled={loading}
                >
                  <Eraser size={18} />
                  一键清空
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <Sparkles size={18} />
                  )}
                  {loading ? '分析中...' : (result ? '重新分析' : '开始分析')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Result */}
          <div className="card bg-base-100 shadow-xl h-fit min-h-[500px]">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-lg">分析报告</h2>
                {result && (
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => exportToTxt(result)}
                    >
                      <FileText size={16} />
                      导出 TXT
                    </button>
                    <button 
                      className="btn btn-sm btn-outline btn-primary"
                      onClick={() => exportToWord(result)}
                    >
                      <Download size={16} />
                      导出 Word
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-base-200 rounded-box p-6 h-full min-h-[400px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-base-content/50 gap-4">
                    <span className="loading loading-dots loading-lg text-primary"></span>
                    <p>正在深度分析中，请稍候...</p>
                  </div>
                ) : result ? (
                  <div className="prose prose-sm md:prose-base max-w-none">
                    <ReactMarkdown>{renderResultMarkdown()}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-base-content/30">
                    <p>输入内容并点击分析，此处将显示结果</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
