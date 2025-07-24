import React, { useState, useEffect } from 'react';
import { Upload, Download, Save, X, Plus, Trash2, Users, Briefcase } from 'lucide-react';

interface Position {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface User {
  id: string;
  name: string;
  role: 'interviewer' | 'candidate';
}

interface Question {
  id?: number;
  position_id: number;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export default function AdminPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [newPositionName, setNewPositionName] = useState('');
  const [newPositionDesc, setNewPositionDesc] = useState('');
  const [newPositionDifficulty, setNewPositionDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [loading, setLoading] = useState(false);

  // 新问题状态
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id' | 'position_id'>>({
    question: '',
    answer: '',
    difficulty: 'medium',
    tags: []
  });
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  useEffect(() => {
    fetchPositions();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      fetchQuestions(selectedPosition);
    }
  }, [selectedPosition]);

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/databases/admin/positions');
      const data = await response.json();
      if (data.success) {
        setPositions(data.positions);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/databases/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchQuestions = async (positionId: number) => {
    try {
      const response = await fetch(`/api/databases/admin/questions?position_id=${positionId}`);
      const data = await response.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const addPosition = async () => {
    if (!newPositionName.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/databases/admin/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPositionName,
          description: newPositionDesc,
          difficulty: newPositionDifficulty
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPositions();
        setNewPositionName('');
        setNewPositionDesc('');
        setShowAddPosition(false);
      }
    } catch (error) {
      console.error('Failed to add position:', error);
    }
    setLoading(false);
  };

  const updateUserRole = async (userId: string, role: 'interviewer' | 'candidate') => {
    try {
      const response = await fetch('/api/databases/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const addQuestion = async () => {
    if (!selectedPosition || !newQuestion.question.trim() || !newQuestion.answer.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/databases/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuestion,
          position_id: selectedPosition
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchQuestions(selectedPosition);
        setNewQuestion({
          question: '',
          answer: '',
          difficulty: 'medium',
          tags: []
        });
        setShowAddQuestion(false);
      }
    } catch (error) {
      console.error('Failed to add question:', error);
    }
    setLoading(false);
  };

  const deleteQuestion = async (questionId: number) => {
    try {
      const response = await fetch(`/api/databases/admin/questions?id=${questionId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success && selectedPosition) {
        await fetchQuestions(selectedPosition);
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const saveQuestions = async () => {
    if (!selectedPosition) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/databases/admin/questions/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_id: selectedPosition,
          questions: questions
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('保存成功！');
      }
    } catch (error) {
      console.error('Failed to save questions:', error);
    }
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPosition) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedQuestions = JSON.parse(content) as Question[];
        
        const response = await fetch('/api/databases/admin/questions/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position_id: selectedPosition,
            questions: parsedQuestions
          })
        });
        
        const data = await response.json();
        if (data.success) {
          await fetchQuestions(selectedPosition);
          alert('文件上传成功！');
        }
      } catch (error) {
        console.error('Failed to parse or upload file:', error);
        alert('文件格式错误，请检查JSON格式');
      }
    };
    reader.readAsText(file);
  };

  const downloadSample = () => {
    const sampleData = [
      {
        question: "请介绍一下你自己",
        answer: "这是一个开放性问题，面试者可以简要介绍自己的背景、经验和优势。",
        difficulty: "easy",
        tags: ["自我介绍", "基础问题"]
      },
      {
        question: "你对这个岗位的理解是什么？",
        answer: "面试者应该展示对岗位职责的理解和相关技能的匹配度。",
        difficulty: "medium",
        tags: ["岗位理解", "职业规划"]
      }
    ];
    
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_sample.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">管理员控制台</h1>

      {/* 第一行：问题管理 + 岗位管理 */}
      <div className="flex gap-6 mb-6">
        {/* 问题管理 */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              问题管理
              {selectedPosition && (
                <span className="text-sm text-gray-500 ml-2">
                  - {positions.find(p => p.id === selectedPosition)?.name}
                </span>
              )}
            </h2>

            <div className="flex gap-2">
              <button
                onClick={downloadSample}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                下载示例
              </button>

              <label className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                上传文件
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={!selectedPosition}
                />
              </label>

              <button
                onClick={saveQuestions}
                disabled={!selectedPosition || loading}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>

          {!selectedPosition ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>请先选择一个岗位来管理对应的问题库</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setShowAddQuestion(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
              >
                <Plus className="w-5 h-5 mx-auto mb-2" />
                添加新问题
              </button>

              {showAddQuestion && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-3">添加新问题</h3>
                  <div className="space-y-3">
                    <textarea
                      placeholder="问题内容"
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
                    />
                    <textarea
                      placeholder="参考答案"
                      value={newQuestion.answer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                    />
                    <div className="flex gap-3">
                      <select
                        value={newQuestion.difficulty}
                        onChange={(e) =>
                          setNewQuestion({ ...newQuestion, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="easy">简单</option>
                        <option value="medium">中等</option>
                        <option value="hard">困难</option>
                      </select>
                      <input
                        placeholder="标签 (用逗号分隔)"
                        value={newQuestion.tags.join(', ')}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addQuestion}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        添加
                      </button>
                      <button
                        onClick={() => setShowAddQuestion(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((question, index) => (
                  <div key={question.id || index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                            question.difficulty
                          )}`}
                        >
                          {question.difficulty === 'easy'
                            ? '简单'
                            : question.difficulty === 'medium'
                            ? '中等'
                            : '困难'}
                        </span>
                        {question.tags.length > 0 && (
                          <div className="flex gap-1">
                            {question.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => question.id && deleteQuestion(question.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                    <p className="text-sm text-gray-600">{question.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 岗位管理 */}
        <div className="w-80 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              岗位管理
            </h3>

            <div className="space-y-3">
              {positions.map((position) => (
                <div
                  key={position.id}
                  onClick={() => setSelectedPosition(position.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedPosition === position.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{position.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{position.description}</div>
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      position.difficulty
                    )}`}
                  >
                    {position.difficulty === 'easy'
                      ? '简单'
                      : position.difficulty === 'medium'
                      ? '中等'
                      : '困难'}
                  </span>
                </div>
              ))}

              {showAddPosition ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                  <input
                    placeholder="岗位名称"
                    value={newPositionName}
                    onChange={(e) => setNewPositionName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2"
                  />
                  <textarea
                    placeholder="岗位描述"
                    value={newPositionDesc}
                    onChange={(e) => setNewPositionDesc(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2 resize-none h-16"
                  />
                  <select
                    value={newPositionDifficulty}
                    onChange={(e) => setNewPositionDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full p-2 border border-gray-300 rounded-md mb-3"
                  >
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={addPosition}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      添加
                    </button>
                    <button
                      onClick={() => setShowAddPosition(false)}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddPosition(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-sm">添加岗位</div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 第二行：人员管理 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          人员管理
        </h3>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.id}</div>
              </div>
              <select
                value={user.role}
                onChange={(e) => updateUserRole(user.id, e.target.value as 'interviewer' | 'candidate')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="candidate">面试官</option>
                <option value="interviewer">面试者</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}