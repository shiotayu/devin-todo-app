import { useState, useMemo } from 'react'
import { Plus, Check, X, Edit2, Trash2, Calendar, Search, AlertCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from './hooks/useAuth'
import { useTodos, type Priority, type Category } from './hooks/useTodos'
import Auth from './components/Auth'
import './App.css'

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'high': return 'destructive'
    case 'medium': return 'secondary'
    case 'low': return 'outline'
    default: return 'secondary'
  }
}

const getCategoryColor = (category: Category) => {
  switch (category) {
    case 'work': return 'bg-blue-100 text-blue-800'
    case 'personal': return 'bg-green-100 text-green-800'
    case 'shopping': return 'bg-purple-100 text-purple-800'
    case 'health': return 'bg-red-100 text-red-800'
    case 'other': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getCategoryLabel = (category: Category) => {
  switch (category) {
    case 'work': return '仕事'
    case 'personal': return '個人'
    case 'shopping': return '買い物'
    case 'health': return '健康'
    case 'other': return 'その他'
    default: return 'その他'
  }
}

const getPriorityLabel = (priority: Priority) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return '中'
  }
}

function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  
  const { todos, loading: todosLoading, addTodo, updateTodo, deleteTodo } = useTodos(user?.id)
  
  const [inputText, setInputText] = useState('')
  const [inputDueDate, setInputDueDate] = useState('')
  const [inputCategory, setInputCategory] = useState<Category>('personal')
  const [inputPriority, setInputPriority] = useState<Priority>('medium')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editCategory, setEditCategory] = useState<Category>('personal')
  const [editPriority, setEditPriority] = useState<Priority>('medium')
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [showCompleted, setShowCompleted] = useState(true)

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchText.toLowerCase())
      const matchesCategory = filterCategory === 'all' || todo.category === filterCategory
      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority
      const matchesCompleted = showCompleted || !todo.completed
      
      return matchesSearch && matchesCategory && matchesPriority && matchesCompleted
    })
  }, [todos, searchText, filterCategory, filterPriority, showCompleted])

  const handleAddTodo = async () => {
    if (inputText.trim() !== '') {
      await addTodo(inputText.trim(), inputDueDate || undefined, inputCategory, inputPriority)
      setInputText('')
      setInputDueDate('')
      setInputCategory('personal')
      setInputPriority('medium')
    }
  }

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id)
  }

  const toggleComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      await updateTodo(id, { completed: !todo.completed })
    }
  }

  const startEdit = (id: string, text: string, dueDate?: string, category: Category = 'personal', priority: Priority = 'medium') => {
    setEditingId(id)
    setEditText(text)
    setEditDueDate(dueDate || '')
    setEditCategory(category)
    setEditPriority(priority)
  }

  const saveEdit = async (id: string) => {
    if (editText.trim() !== '') {
      await updateTodo(id, {
        text: editText.trim(),
        dueDate: editDueDate || undefined,
        category: editCategory,
        priority: editPriority
      })
    }
    setEditingId(null)
    setEditText('')
    setEditDueDate('')
    setEditCategory('personal')
    setEditPriority('medium')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
    setEditDueDate('')
    setEditCategory('personal')
    setEditPriority('medium')
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action()
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />
  }


  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1"></div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">
                TODOアプリ
              </CardTitle>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">
                完了: {completedCount} / {totalCount}
              </p>
              <div className="w-full max-w-md mx-auto">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              <Input
                type="text"
                placeholder="新しいタスクを入力..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddTodo)}
                className="lg:col-span-1"
              />
              <div className="flex gap-2 lg:col-span-2">
                <Input
                  type="date"
                  value={inputDueDate}
                  onChange={(e) => {
                    const value = e.target.value
                    setInputDueDate(value)
                  }}
                  onInput={(e) => {
                    const value = (e.target as HTMLInputElement).value
                    setInputDueDate(value)
                  }}
                  className="flex-1"
                />
                <Select value={inputCategory} onValueChange={(value: Category) => setInputCategory(value)}>
                  <SelectTrigger className="w-24 sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">仕事</SelectItem>
                    <SelectItem value="personal">個人</SelectItem>
                    <SelectItem value="shopping">買い物</SelectItem>
                    <SelectItem value="health">健康</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={inputPriority} onValueChange={(value: Priority) => setInputPriority(value)}>
                  <SelectTrigger className="w-16 sm:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTodo} className="lg:col-span-1">
                <Plus className="w-4 h-4 mr-2" />
                追加
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="タスクを検索..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={(value: Category | 'all') => setFilterCategory(value)}>
                  <SelectTrigger className="w-24 sm:w-32">
                    <SelectValue placeholder="カテゴリ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    <SelectItem value="work">仕事</SelectItem>
                    <SelectItem value="personal">個人</SelectItem>
                    <SelectItem value="shopping">買い物</SelectItem>
                    <SelectItem value="health">健康</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={(value: Priority | 'all') => setFilterPriority(value)}>
                  <SelectTrigger className="w-16 sm:w-20">
                    <SelectValue placeholder="優先度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="px-3"
                >
                  {showCompleted ? '完了を隠す' : '完了を表示'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {todosLoading ? (
                <div className="text-center py-8 text-gray-500">
                  読み込み中...
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {todos.length === 0 ? 'タスクがありません。新しいタスクを追加してください。' : '条件に一致するタスクがありません。'}
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <Card key={todo.id} className={`transition-all ${todo.completed ? 'bg-gray-50' : 'bg-white'}`}>
                    <CardContent className="p-3 sm:p-4">
                      {editingId === todo.id ? (
                        <div className="space-y-3">
                          <Input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, () => saveEdit(todo.id))}
                            className="w-full"
                            autoFocus
                          />
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                              className="flex-1"
                            />
                            <Select value={editCategory} onValueChange={(value: Category) => setEditCategory(value)}>
                              <SelectTrigger className="w-full sm:w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="work">仕事</SelectItem>
                                <SelectItem value="personal">個人</SelectItem>
                                <SelectItem value="shopping">買い物</SelectItem>
                                <SelectItem value="health">健康</SelectItem>
                                <SelectItem value="other">その他</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={editPriority} onValueChange={(value: Priority) => setEditPriority(value)}>
                              <SelectTrigger className="w-full sm:w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">高</SelectItem>
                                <SelectItem value="medium">中</SelectItem>
                                <SelectItem value="low">低</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => saveEdit(todo.id)}
                              className="flex-1"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              保存
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEdit}
                              className="flex-1"
                            >
                              <X className="w-4 h-4 mr-2" />
                              キャンセル
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleComplete(todo.id)}
                              className={`mt-1 p-1 ${todo.completed ? 'bg-green-100 border-green-300' : ''}`}
                            >
                              <Check className={`w-4 h-4 ${todo.completed ? 'text-green-600' : 'text-gray-400'}`} />
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm sm:text-base ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {todo.text}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant={getPriorityColor(todo.priority)} className="text-xs">
                                  {getPriorityLabel(todo.priority)}
                                </Badge>
                                <Badge className={`text-xs ${getCategoryColor(todo.category)}`}>
                                  {getCategoryLabel(todo.category)}
                                </Badge>
                                {todo.dueDate && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    <span className={`${getDaysUntilDue(todo.dueDate) < 0 ? 'text-red-600 font-semibold' : getDaysUntilDue(todo.dueDate) <= 3 ? 'text-orange-600' : 'text-gray-600'}`}>
                                      {getDaysUntilDue(todo.dueDate) < 0 ? (
                                        <>
                                          <AlertCircle className="w-3 h-3 inline mr-1" />
                                          {Math.abs(getDaysUntilDue(todo.dueDate))}日遅れ
                                        </>
                                      ) : getDaysUntilDue(todo.dueDate) === 0 ? (
                                        '今日まで'
                                      ) : (
                                        `あと${getDaysUntilDue(todo.dueDate)}日`
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEdit(todo.id, todo.text, todo.dueDate, todo.category, todo.priority)}
                                className="p-1"
                              >
                                <Edit2 className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="p-1"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
