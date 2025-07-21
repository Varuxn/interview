import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

// 类型定义
interface Position {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface User {
  id: string;
  name: string;
  role: 'interviewer' | 'candidate';
}

interface Question {
  id?: number;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

const AdminDashboard = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [newPositionName, setNewPositionName] = useState('');
  const [newPositionDifficulty, setNewPositionDifficulty] = useState<Position['difficulty']>('medium');
  
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id'>>({ 
    content: '', 
    difficulty: 'medium' 
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 获取岗位数据
  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/databases/admin/positions');
      const data = await res.json();
      setPositions(data);
      if (data.length > 0 && !selectedPosition) {
        setSelectedPosition(data[0]);
      }
    } catch (error) {
      toast.error('获取岗位数据失败');
    }
  };

  // 获取用户数据
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/databases/admin/roles');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error('获取用户数据失败');
    }
  };

  // 获取问题数据
  const fetchQuestions = async () => {
    if (!selectedPosition) return;
    try {
      const res = await fetch(`/api/databases/admin/questions?position_id=${selectedPosition.id}`);
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      toast.error('获取问题数据失败');
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      fetchQuestions();
    }
  }, [selectedPosition]);

  // 添加新岗位
  const handleAddPosition = async () => {
    if (!newPositionName.trim()) {
      toast.warning('请输入岗位名称');
      return;
    }
    
    try {
      const res = await fetch('/api/databases/admin/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newPositionName, 
          difficulty: newPositionDifficulty 
        })
      });
      
      if (res.ok) {
        toast.success('岗位添加成功');
        setNewPositionName('');
        fetchPositions();
      } else {
        toast.error('添加岗位失败');
      }
    } catch (error) {
      toast.error('添加岗位失败');
    }
  };

  // 更新用户角色
  const handleUpdateRole = async (userId: string, newRole: 'interviewer' | 'candidate') => {
    try {
      const res = await fetch('/api/databases/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      
      if (res.ok) {
        toast.success('用户角色更新成功');
        fetchUsers();
      } else {
        toast.error('更新角色失败');
      }
    } catch (error) {
      toast.error('更新角色失败');
    }
  };

  // 添加新问题
  const handleAddQuestion = () => {
    if (!newQuestion.content.trim()) {
      toast.warning('请输入问题内容');
      return;
    }
    setQuestions([...questions, { ...newQuestion, id: Date.now() }]);
    setNewQuestion({ content: '', difficulty: 'medium' });
  };

  // 删除问题
  const handleDeleteQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // 保存问题
  const handleSaveQuestions = async () => {
    if (!selectedPosition) {
      toast.warning('请先选择岗位');
      return;
    }
    
    try {
      const res = await fetch('/api/databases/admin/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: selectedPosition.id,
          questions
        })
      });
      
      if (res.ok) {
        toast.success('问题保存成功');
        fetchQuestions();
      } else {
        toast.error('保存问题失败');
      }
    } catch (error) {
      toast.error('保存问题失败');
    }
  };

  // 取消编辑
  const handleCancel = () => {
    if (selectedPosition) {
      fetchQuestions();
    }
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsedData)) {
          setQuestions(parsedData);
          toast.success('文件上传成功');
        } else {
          toast.error('文件格式不正确');
        }
      } catch (error) {
        toast.error('解析JSON文件失败');
      }
    };
    reader.readAsText(file);
  };

  // 下载示例文件
  const downloadSampleFile = () => {
    const sampleData = [
      {
        "content": "请解释React中的虚拟DOM",
        "difficulty": "medium",
        "tags": ["React", "前端"]
      },
      {
        "content": "什么是闭包？请举例说明",
        "difficulty": "easy",
        "tags": ["JavaScript", "基础"]
      }
    ];
    
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_sample.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardContainer>
      <ToastContainer position="top-right" autoClose={3000} />
      <MainContent>
        <QuestionSection>
          <SectionHeader>
            <h2>{selectedPosition ? `${selectedPosition.name} 问题库` : '请选择岗位'}</h2>
            <PositionSelector>
              <select 
                value={selectedPosition?.id || ''}
                onChange={(e) => {
                  const position = positions.find(p => p.id === parseInt(e.target.value));
                  setSelectedPosition(position || null);
                }}
              >
                {positions.map(position => (
                  <option key={position.id} value={position.id}>
                    {position.name} ({position.difficulty})
                  </option>
                ))}
              </select>
            </PositionSelector>
          </SectionHeader>
          
          <QuestionList>
            {questions.map((q, index) => (
              <QuestionItem key={q.id || index}>
                <QuestionContent>{q.content}</QuestionContent>
                <DifficultyTag difficulty={q.difficulty}>
                  {q.difficulty === 'easy' ? '简单' : q.difficulty === 'medium' ? '中等' : '困难'}
                </DifficultyTag>
                <DeleteButton onClick={() => handleDeleteQuestion(index)}>删除</DeleteButton>
              </QuestionItem>
            ))}
            
            <NewQuestionForm>
              <QuestionInput
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                placeholder="输入新问题..."
              />
              <DifficultySelect
                value={newQuestion.difficulty}
                onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value as any})}
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </DifficultySelect>
              <AddButton onClick={handleAddQuestion}>添加</AddButton>
            </NewQuestionForm>
          </QuestionList>
          
          <ActionButtons>
            <Button primary onClick={handleSaveQuestions}>保存</Button>
            <Button onClick={handleCancel}>取消</Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              上传文件
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".json" 
                onChange={handleFileUpload} 
              />
            </Button>
            <Button onClick={downloadSampleFile}>下载示例</Button>
          </ActionButtons>
        </QuestionSection>
      </MainContent>
      
      <Sidebar>
        <PositionManagement>
          <SectionHeader>
            <h3>岗位管理</h3>
          </SectionHeader>
          <PositionForm>
            <Input 
              type="text" 
              value={newPositionName} 
              onChange={(e) => setNewPositionName(e.target.value)} 
              placeholder="新岗位名称" 
            />
            <DifficultySelect
              value={newPositionDifficulty}
              onChange={(e) => setNewPositionDifficulty(e.target.value as any)}
            >
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </DifficultySelect>
            <AddButton onClick={handleAddPosition}>添加岗位</AddButton>
          </PositionForm>
        </PositionManagement>
        
        <UserManagement>
          <SectionHeader>
            <h3>用户角色管理</h3>
          </SectionHeader>
          <UserList>
            {users.map(user => (
              <UserItem key={user.id}>
                <UserName>{user.name}</UserName>
                <RoleToggle>
                  <RoleButton 
                    active={user.role === 'candidate'} 
                    onClick={() => handleUpdateRole(user.id, 'candidate')}
                  >
                    面试者
                  </RoleButton>
                  <RoleButton 
                    active={user.role === 'interviewer'} 
                    onClick={() => handleUpdateRole(user.id, 'interviewer')}
                  >
                    面试官
                  </RoleButton>
                </RoleToggle>
              </UserItem>
            ))}
          </UserList>
        </UserManagement>
      </Sidebar>
    </DashboardContainer>
  );
};

// 样式组件
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const MainContent = styled.div`
  flex: 2;
  padding: 2rem;
  background-color: white;
  border-right: 1px solid #eaeaea;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
`;

const Sidebar = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: white;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eaeaea;
  
  h2, h3 {
    margin: 0;
    color: #2c3e50;
    font-weight: 600;
  }
`;

const QuestionSection = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const PositionSelector = styled.div`
  select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
    font-size: 14px;
  }
`;

const QuestionList = styled.div`
  max-height: 60vh;
  overflow-y: auto;
  margin-bottom: 1.5rem;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1rem;
`;

const QuestionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f1f1f1;
  }
`;

const QuestionContent = styled.div`
  flex: 1;
  margin-right: 15px;
  font-size: 15px;
  color: #333;
`;

const DifficultyTag = styled.span<{ difficulty: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${props => 
    props.difficulty === 'easy' ? '#4caf50' : 
    props.difficulty === 'medium' ? '#ff9800' : '#f44336'};
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
`;

const NewQuestionForm = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7ff;
  border-radius: 6px;
`;

const QuestionInput = styled.textarea`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 60px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
`;

const DifficultySelect = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  min-width: 100px;
`;

const AddButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #388e3c;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background-color: ${props => props.primary ? '#2196f3' : '#f5f5f5'};
  color: ${props => props.primary ? 'white' : '#333'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#0b7dda' : '#e0e0e0'};
  }
`;

const PositionManagement = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const PositionForm = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserManagement = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const UserList = styled.div`
  max-height: 40vh;
  overflow-y: auto;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
`;

const UserName = styled.div`
  font-size: 14px;
  color: #333;
`;

const RoleToggle = styled.div`
  display: flex;
  gap: 5px;
`;

const RoleButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: ${props => props.active ? '#2196f3' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#0b7dda' : '#f5f5f5'};
  }
`;

export default AdminDashboard;