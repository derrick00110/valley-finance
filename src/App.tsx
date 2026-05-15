// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, DollarSign, Download, Upload, Plus, Trash2, CheckCircle, GraduationCap, AlertCircle, Wallet, Cloud, Loader2, Building2, Store, ArrowLeftRight } from 'lucide-react';

// 1. Firebase 配置
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';

const myFirebaseConfig = {
  apiKey: "AIzaSyD525Z346nu8-g9t8b3yyn8udsk0619Lwg",
  authDomain: "sgyy-caiwu-xiton.firebaseapp.com",
  projectId: "sgyy-caiwu-xiton",
  storageBucket: "sgyy-caiwu-xiton.firebasestorage.app",
  messagingSenderId: "516196490269",
  appId: "1:516196490269:web:adec80957112528fc6faf4",
  measurementId: "G-5MWZ6YYGTH"
};

// 初始化数据库
const app = initializeApp(myFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'shangu-music-app';

// ===================== 门店配置 =====================
const BRANCHES = [
  { id: 'main', name: '总店', shortName: '总店' },
  { id: 'chebei', name: '广州车陂店', shortName: '车陂店' },
];

const getBranchName = (branchId) => {
  const b = BRANCHES.find(b => b.id === branchId);
  return b ? b.name : branchId;
};

const getCollectionName = (branchId) => {
  // 总店保持原有集合名（向后兼容），分店用独立集合
  if (branchId === 'main') return 'shanguyinyue_finances';
  return `shanguyinyue_finances_${branchId}`;
};
// ===================================================

// 各门店的默认数据（按门店分组）
const defaultDataByBranch = {
  main: [
    { id: '1', month: '10月', student: '贺同学', course: '未写明', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '已付全款' },
    { id: '2', month: '10月', student: '杨同学', course: '未写明', revenue: 1000, teacher: '郭', commissionPaid: 400, isFinished: true, notes: '已付1000元' },
    { id: '3', month: '10月', student: '郭同学', course: '架子鼓', revenue: 2480, teacher: '刘', commissionPaid: 494, isFinished: false, notes: '已付全款(记录已结494)' },
    { id: '4', month: '10月', student: '李同学', course: '钢琴', revenue: 2200, teacher: '郭', commissionPaid: 880, isFinished: true, notes: '已付全款' },
    { id: '5', month: '10月', student: '唐同学', course: '吉他', revenue: 2480, teacher: '郭', commissionPaid: 992, isFinished: true, notes: '郭结496+496' },
    { id: '6', month: '11月', student: '杜同学', course: '吉他', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '已付全款' },
    { id: '7', month: '11月', student: '婷同学', course: '声乐', revenue: 4680, teacher: '郭', commissionPaid: 936, isFinished: false, notes: '20+2送节' },
    { id: '8', month: '11月', student: '双王同学', course: '声乐', revenue: 3350, teacher: '郭', commissionPaid: 1340, isFinished: false, notes: '40%全结清(提前预结)' },
    { id: '9', month: '11月', student: '晓东同学', course: '声乐', revenue: 300, teacher: '郭', commissionPaid: 120, isFinished: true, notes: '300定金已结课' },
    { id: '10', month: '11月', student: '成同学', course: '钢琴初级', revenue: 2480, teacher: '郭', commissionPaid: 992, isFinished: true, notes: '已付2480' },
    { id: '11', month: '11月', student: '罗同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
    { id: '12', month: '11月', student: '袁国翔', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 1032, isFinished: true, notes: '已结清' },
    { id: '13', month: '11月', student: '冬棠', course: '架子鼓初级', revenue: 2480, teacher: '钱', commissionPaid: 496, isFinished: false, notes: '仅白天' },
    { id: '14', month: '11月', student: '杜同学', course: '钢琴初转高', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '待补1800' },
    { id: '15', month: '11月', student: '伍同学', course: '吉他高级', revenue: 4280, teacher: '郭', commissionPaid: 856, isFinished: false, notes: '已付4280' },
    { id: '16', month: '11月', student: '谢同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
    { id: '17', month: '11月', student: '江同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
    { id: '18', month: '11月', student: '郑同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
    { id: '19', month: '12月', student: '叶同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
    { id: '20', month: '12月', student: '刘同学', course: '钢琴初级', revenue: 2480, teacher: '黄', commissionPaid: 992, isFinished: true, notes: '已结课' },
    { id: '21', month: '12月', student: '佩佩同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
    { id: '22', month: '12月', student: '佩佩同学', course: '架子鼓初级', revenue: 2480, teacher: '钱', commissionPaid: 496, isFinished: false, notes: '全款' },
    { id: '23', month: '12月', student: '潘同学', course: '架子鼓高级', revenue: 4280, teacher: '钱', commissionPaid: 856, isFinished: false, notes: '全款' },
    { id: '24', month: '12月', student: '苏同学', course: '架子鼓初级', revenue: 2480, teacher: '钱', commissionPaid: 496, isFinished: false, notes: '全款' },
    { id: '25', month: '12月', student: '余同学', course: '钢琴初级', revenue: 2480, teacher: '黄', commissionPaid: 0, isFinished: false, notes: '黄老师未结' },
    { id: '26', month: '12月', student: '莫同学', course: '即兴伴奏初级', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '全款' },
    { id: '27', month: '12月', student: '冬青同学', course: '声乐(一二)', revenue: 3470, teacher: '郭', commissionPaid: 694, isFinished: false, notes: '赠送2节' },
    { id: '28', month: '12月', student: '刘雨笠', course: '钢琴初级', revenue: 2480, teacher: '黄', commissionPaid: 496, isFinished: false, notes: '全款' },
    { id: '29', month: '12月', student: '梁同学', course: '声乐', revenue: 500, teacher: '郭', commissionPaid: 0, isFinished: false, notes: '500定金未结' },
    { id: '30', month: '12月', student: '蟹同学', course: '声乐', revenue: 800, teacher: '郭', commissionPaid: 320, isFinished: true, notes: '800定金已结课' },
    { id: '31', month: '12月', student: '思思同学', course: '声乐+钢琴', revenue: 4880, teacher: '郭', commissionPaid: 1952, isFinished: true, notes: '已结课' },
    { id: '32', month: '1月', student: '小白同学', course: '声乐', revenue: 2480, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '徐老师待结' },
    { id: '33', month: '1月', student: '李虾仁同学', course: '声乐', revenue: 2580, teacher: '郭', commissionPaid: 516, isFinished: false, notes: '10节' },
    { id: '34', month: '1月', student: '潘诚同学', course: '声乐', revenue: 300, teacher: '郭', commissionPaid: 120, isFinished: true, notes: '定金已结课' },
    { id: '35', month: '1月', student: '叶同学', course: '钢琴', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '全款' },
    { id: '36', month: '1月', student: '潘诚同学', course: '声乐', revenue: 2280, teacher: '郭', commissionPaid: 456, isFinished: false, notes: '全款' },
    { id: '37', month: '1月', student: '蟹同学', course: '声乐', revenue: 1680, teacher: '郭', commissionPaid: 336, isFinished: false, notes: '已结336' },
    { id: '38', month: '1月', student: '吴慧婷', course: '吉他初级', revenue: 2280, teacher: '郭', commissionPaid: 456, isFinished: false, notes: '全款' },
    { id: '39', month: '1月', student: '王津越', course: '钢琴初级', revenue: 2480, teacher: '郭', commissionPaid: 496, isFinished: false, notes: '全款' },
    { id: '40', month: '1月', student: '王球', course: '钢琴初级', revenue: 2480, teacher: '黄', commissionPaid: 0, isFinished: false, notes: '黄老师未结' },
    { id: '41', month: '3月', student: '小爱同学', course: '吉他初级', revenue: 2480, teacher: '谷', commissionPaid: 0, isFinished: false, notes: '谷未结' },
    { id: '42', month: '3月', student: '余冠晓', course: '钢琴初转高', revenue: 2480, teacher: '黄', commissionPaid: 0, isFinished: false, notes: '待结' },
    { id: '43', month: '3月', student: '芦雅慧', course: '吉他正式课', revenue: 2480, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '待结' },
    { id: '44', month: '3月', student: '杨同学', course: '声乐正式课', revenue: 2580, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '待结' },
    { id: '45', month: '3月', student: '林玉霞', course: '吉他正式课', revenue: 2480, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '待结' },
    { id: '46', month: '3月', student: '林玉霞', course: '声乐正式课', revenue: 1580, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '6节' },
    { id: '47', month: '3月', student: '李涵', course: '声乐吉他', revenue: 5060, teacher: '徐', commissionPaid: 0, isFinished: false, notes: '待结' },
  ],
  chebei: [
    // 广州车陂店 - 初始为空，等待用户录入
  ],
};

export default function App() {
  const fileInputRef = useRef(null);
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);

  // ===================== 门店管理 =====================
  const [currentBranch, setCurrentBranch] = useState(() => {
    return localStorage.getItem('finance_branch') || 'main';
  });

  const switchBranch = (branchId) => {
    setCurrentBranch(branchId);
    localStorage.setItem('finance_branch', branchId);
    setIsSyncing(true); // 切换门店时显示加载状态
    setSearchTerm('');
    setFilterMonth('全部');
    setFilterTeacher('全部');
    setFilterCourseStatus('全部');
  };
  // ===================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('全部');
  const [filterTeacher, setFilterTeacher] = useState('全部');
  const [filterCourseStatus, setFilterCourseStatus] = useState('全部');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ month: '3月', student: '', course: '', revenue: '', teacher: '', notes: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  // 1. 初始化数据库授权登录
  useEffect(() => {
    if (!auth) {
      setIsSyncing(false);
      return;
    }
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("数据库验证失败", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. 监听云端数据库数据变化（按门店监听不同集合）
  useEffect(() => {
    if (!user || !db) return;
    setIsSyncing(true);

    const collectionName = getCollectionName(currentBranch);
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName);

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ ...doc.data(), _docId: doc.id }));
      docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setData(docs);
      setIsSyncing(false);
    }, (error) => {
      console.error(`读取门店(${currentBranch})数据失败`, error);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [user, currentBranch]); // currentBranch 变化时重新订阅

  // 业务逻辑：计算提成
  const processData = (rawData) => {
    return rawData.map(item => {
      const revenue = Number(item.revenue) || 0;
      const commissionPaid = Number(item.commissionPaid) || 0;
      const totalCommissionTarget = revenue * 0.4;
      const firstStageTarget = revenue * 0.2;
      const currentEarned = item.isFinished ? totalCommissionTarget : firstStageTarget;
      const currentPending = Math.max(0, currentEarned - commissionPaid);
      const futurePending = item.isFinished ? 0 : Math.max(0, totalCommissionTarget - Math.max(commissionPaid, firstStageTarget));

      return { ...item, totalCommissionTarget, currentEarned, currentPending, futurePending };
    });
  };

  const processedData = useMemo(() => processData(data), [data]);

  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      const matchSearch = item.student.includes(searchTerm) || item.course.includes(searchTerm);
      const matchMonth = filterMonth === '全部' || item.month === filterMonth;
      const matchTeacher = filterTeacher === '全部' || item.teacher === filterTeacher;
      const matchCourseStatus = filterCourseStatus === '全部'
        ? true
        : filterCourseStatus === '已结课' ? item.isFinished : !item.isFinished;

      return matchSearch && matchMonth && matchTeacher && matchCourseStatus;
    });
  }, [processedData, searchTerm, filterMonth, filterTeacher, filterCourseStatus]);

  const metrics = useMemo(() => {
    let totalRevenue = 0, totalCurrentPending = 0, totalFuturePending = 0, totalPaid = 0;
    filteredData.forEach(item => {
      totalRevenue += Number(item.revenue);
      totalCurrentPending += item.currentPending;
      totalFuturePending += item.futurePending;
      totalPaid += Number(item.commissionPaid);
    });
    return { totalRevenue, totalCurrentPending, totalFuturePending, totalPaid };
  }, [filteredData]);

  const updateCloudRecord = async (id, updates) => {
    if (!user || !db) return;
    try {
      const collectionName = getCollectionName(currentBranch);
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, id);
      await setDoc(docRef, updates, { merge: true });
    } catch (err) {
      console.error("云端更新失败", err);
      setAlertMessage("数据同步失败，请检查网络！");
    }
  };

  const handleToggleStatus = (id) => {
    const item = data.find(d => d.id === id);
    if(item) updateCloudRecord(id, { isFinished: !item.isFinished });
  };

  const handlePayPending = (id, amountToPay) => {
    const item = data.find(d => d.id === id);
    if(item) updateCloudRecord(id, { commissionPaid: Number(item.commissionPaid) + amountToPay });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!user || !db) {
      setAlertMessage("等待数据库连接中，请稍后再试...");
      return;
    }
    const newItemId = `branch_${currentBranch}_${Date.now()}`;
    const newItem = {
      ...newRecord,
      id: newItemId,
      revenue: Number(newRecord.revenue),
      commissionPaid: 0,
      isFinished: false,
      branch: currentBranch,   // 标记所属门店
      createdAt: Date.now()
    };

    setIsAddModalOpen(false);
    setNewRecord({ month: '3月', student: '', course: '', revenue: '', teacher: '', notes: '' });

    const collectionName = getCollectionName(currentBranch);
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, newItemId);
    await setDoc(docRef, newItem);
  };

  const handleDelete = (id) => setDeleteConfirmId(id);
  const confirmDelete = async () => {
    if (deleteConfirmId && user && db) {
      const collectionName = getCollectionName(currentBranch);
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, deleteConfirmId);
      await deleteDoc(docRef);
    }
    setDeleteConfirmId(null);
  };

  // 一键导入当前门店的默认历史数据
  const injectDefaultDataToCloud = async () => {
    if (!user || !db) return;
    const branchData = defaultDataByBranch[currentBranch] || [];
    if (branchData.length === 0) {
      setAlertMessage(`${getBranchName(currentBranch)}暂无默认数据，请手动新增账单`);
      return;
    }

    setAlertMessage(`正在将${getBranchName(currentBranch)}的历史记录推送到云端，请稍候...`);
    try {
      const collectionName = getCollectionName(currentBranch);
      let baseTime = Date.now() - 100000;
      for (const item of branchData) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, item.id);
        await setDoc(docRef, { ...item, createdAt: baseTime + parseInt(item.id), branch: currentBranch });
      }
      setAlertMessage(`${getBranchName(currentBranch)}旧账本导入成功！`);
    } catch(e) {
      setAlertMessage('导入失败，请重试');
    }
  };

  // 从其他门店复制数据（方便车陂店初始化）
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceBranch, setCopySourceBranch] = useState('main');

  const copyDataFromBranch = async () => {
    if (!user || !db || copySourceBranch === currentBranch) return;
    setAlertMessage(`正在从${getBranchName(copySourceBranch)}复制数据到${getBranchName(currentBranch)}...`);
    try {
      const sourceCol = getCollectionName(copySourceBranch);
      const targetCol = getCollectionName(currentBranch);

      // 读取源门店数据
      const sourceRef = collection(db, 'artifacts', appId, 'public', 'data', sourceCol);
      const snapshot = await new Promise((resolve) => {
        const unsub = onSnapshot(sourceRef, (snap) => { unsub(); resolve(snap); });
      });

      if (snapshot.empty) {
        setAlertMessage(`${getBranchName(copySourceBranch)}没有数据可复制`);
        setShowCopyModal(false);
        return;
      }

      let count = 0;
      for (const docSnap of snapshot.docs) {
        const sourceData = docSnap.data();
        const newId = `branch_${currentBranch}_copied_${Date.now()}_${count}`;
        const targetRef = doc(db, 'artifacts', appId, 'public', 'data', targetCol, newId);
        await setDoc(targetRef, {
          ...sourceData,
          id: newId,
          branch: currentBranch,
          createdAt: Date.now() + count,
          notes: (sourceData.notes || '') + ` [从${getBranchName(copySourceBranch)}复制]`
        });
        count++;
      }
      setAlertMessage(`成功从${getBranchName(copySourceBranch)}复制了 ${count} 条记录到${getBranchName(currentBranch)}`);
      setShowCopyModal(false);
    } catch(e) {
      console.error(e);
      setAlertMessage('复制失败，请重试');
    }
  };

  const months = ['全部', ...new Set(data.map(item => item.month))];
  const teachers = ['全部', ...new Set(data.map(item => item.teacher))];

  // 门店颜色
  const branchColors = {
    main: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    chebei: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========== 顶部：门店切换 + 标题 ========== */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                山谷音乐财务系统
                <span className="text-sm font-normal text-slate-500 ml-2 bg-slate-100 px-2 py-1 rounded">多店版 · 协同分步提成</span>
              </h1>
              <div className="flex items-center mt-2 space-x-2">
                {isSyncing ? (
                  <span className="flex items-center text-xs font-medium text-amber-500 bg-amber-50 px-2 py-1 rounded">
                    <Loader2 size={12} className="animate-spin mr-1" /> 同步中...
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    <Cloud size={12} className="mr-1" /> 已接入云端
                  </span>
                )}
                <span className="text-slate-500 text-xs">报名结算20% · 结课尾款20%</span>
              </div>
            </div>

            {/* 门店切换按钮组 */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              {BRANCHES.map((branch) => {
                const colors = branchColors[branch.id] || branchColors.main;
                const isActive = currentBranch === branch.id;
                return (
                  <button
                    key={branch.id}
                    onClick={() => switchBranch(branch.id)}
                    className={`
                      flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? `${colors.bg} ${colors.text} shadow-sm border ${colors.border}`
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                    `}
                  >
                    <Building2 size={16} />
                    <span>{branch.shortName || branch.name}</span>
                    {isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ml-1`}></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 当前门店提示 */}
          <div className="mt-3 flex items-center justify-between">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
              ${branchColors[currentBranch]?.bg || 'bg-slate-100'}
              ${branchColors[currentBranch]?.text || 'text-slate-600'}
            `}>
              <Store size={14} />
              当前查看：{getBranchName(currentBranch)}
              <span className="opacity-60">·</span>
              <span className="opacity-70">{data.length} 条记录</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
              >
                <Plus size={16} className="mr-2" /> 新增账单
              </button>
              {BRANCHES.length > 1 && (
                <button
                  onClick={() => setShowCopyModal(true)}
                  className="flex items-center px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors"
                  title="从其他门店复制数据"
                >
                  <ArrowLeftRight size={16} className="mr-1" /> 复制
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========== 数据卡片 ========== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center text-slate-500 mb-2">
              <DollarSign size={18} className="mr-1 text-emerald-500" />
              <span className="text-sm font-medium">总收学费（当前门店）</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">¥{metrics.totalRevenue.toLocaleString()}</h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center text-slate-500 mb-2">
              <Wallet size={18} className="mr-1 text-blue-500" />
              <span className="text-sm font-medium">已付老师总计</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">¥{metrics.totalPaid.toLocaleString()}</h2>
          </div>

          <div className="bg-rose-50 rounded-2xl p-5 shadow-sm border border-rose-100 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-rose-100/50">
              <AlertCircle size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center text-rose-700 mb-2">
                <AlertCircle size={18} className="mr-1" />
                <span className="text-sm font-bold">当期急需结算</span>
              </div>
              <h2 className="text-2xl font-bold text-rose-700">¥{metrics.totalCurrentPending.toLocaleString()}</h2>
              <p className="text-xs text-rose-600 mt-1 opacity-80">当前欠老师的钱</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center text-slate-500 mb-2">
              <GraduationCap size={18} className="mr-1 text-purple-500" />
              <span className="text-sm font-medium">未来尾款预留</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-600">¥{metrics.totalFuturePending.toLocaleString()}</h2>
            <p className="text-xs text-slate-500 mt-1">结课后需支付的剩余20%</p>
          </div>
        </div>

        {/* ========== 筛选栏 ========== */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="搜索学生或课程..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{m === '全部' ? '全部月份' : m}</option>)}
          </select>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
            {teachers.map(t => <option key={t} value={t}>{t === '全部' ? '所有老师' : `${t}老师`}</option>)}
          </select>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" value={filterCourseStatus} onChange={(e) => setFilterCourseStatus(e.target.value)}>
            <option value="全部">全部课程进度</option>
            <option value="进行中">上课中（仅结20%）</option>
            <option value="已结课">已结课（可结40%）</option>
          </select>
        </div>

        {/* ========== 数据表格 ========== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">基本信息</th>
                  <th className="px-4 py-3 font-semibold">实收（40%封顶）</th>
                  <th className="px-4 py-3 font-semibold">课程进度</th>
                  <th className="px-4 py-3 font-semibold">提成状态（已付/应付）</th>
                  <th className="px-4 py-3 font-semibold text-rose-600">当期欠款</th>
                  <th className="px-4 py-3 font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">

                {filteredData.length === 0 && !isSyncing && (
                  <tr>
                    <td colSpan="6" className="px-4 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Building2 size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-800 mb-2">
                          {getBranchName(currentBranch)} · 暂无数据
                        </h3>
                        <p className="text-sm mb-6 max-w-md">
                          {currentBranch === 'chebei'
                            ? '广州车陂店的财务数据为空。您可以手动新增第一笔账单，或从总店复制数据初始化。'
                            : '暂无财务记录。点击下方按钮导入历史账本，或手动新增账单。'}
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={injectDefaultDataToCloud}
                            className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-xl transition-colors"
                          >
                            一键导入{getBranchName(currentBranch)}历史账本
                          </button>
                          {currentBranch !== 'main' && (
                            <button
                              onClick={() => setShowCopyModal(true)}
                              className="px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium rounded-xl transition-colors"
                            >
                              从其他门店复制数据
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">
                        {row.student}
                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1">{row.month}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{row.course} · <span className="text-indigo-600 font-medium">{row.teacher}老师</span></div>
                      {row.notes && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{row.notes}</div>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">¥{row.revenue}</div>
                      <div className="text-xs text-slate-400 mt-1">总提¥{row.totalCommissionTarget}</div>
                    </td>
                    <td className="px-4 py-4">
                      {row.isFinished ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          <CheckCircle size={12} className="mr-1" /> 已结课
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          进行中（首期）
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${row.currentPending === 0 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                            style={{ width: `${Math.min(100, (row.commissionPaid / row.currentEarned) * 100 || 0)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          ¥{row.commissionPaid} / <span className="text-slate-400">¥{row.currentEarned}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {row.currentPending > 0 ? (
                        <span className="font-bold text-rose-600">¥{row.currentPending}</span>
                      ) : (
                        <span className="text-emerald-600 text-xs font-medium">无欠款</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(row.id)}
                        className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors border ${row.isFinished ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'}`}
                      >
                        {row.isFinished ? '撤销结课' : '标记结课'}
                      </button>

                      {row.currentPending > 0 ? (
                        <button
                          onClick={() => handlePayPending(row.id, row.currentPending)}
                          className="px-2.5 py-1.5 rounded text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                        >
                          发¥{row.currentPending}
                        </button>
                      ) : (
                         <button disabled className="px-2.5 py-1.5 rounded text-xs font-medium bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed">
                          已结清
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(row.id)}
                        className="px-2.5 py-1.5 rounded text-xs font-medium bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== 底部信息 ========== */}
        <div className="text-center text-xs text-slate-400 py-4">
          山谷音乐财务系统 · 多店版 · 数据实时云端同步
          {data.length > 0 && <span> · 当前门店 {data.length} 条记录</span>}
        </div>
      </div>

      {/* ========== 新增账单弹窗 ========== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">新增账单</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <span className="text-slate-400 text-xl">✕</span>
              </button>
            </div>

            {/* 当前门店提示 */}
            <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-medium ${branchColors[currentBranch]?.bg} ${branchColors[currentBranch]?.text}`}>
              <Store size={14} className="inline mr-1" />
              当前录入门店：{getBranchName(currentBranch)}
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">月份</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newRecord.month} onChange={(e) => setNewRecord({...newRecord, month: e.target.value})}>
                    {['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">学生姓名</label>
                  <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="必填" required value={newRecord.student}
                    onChange={(e) => setNewRecord({...newRecord, student: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">课程</label>
                  <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="如：钢琴初级" value={newRecord.course}
                    onChange={(e) => setNewRecord({...newRecord, course: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">老师</label>
                  <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="必填" required value={newRecord.teacher}
                    onChange={(e) => setNewRecord({...newRecord, teacher: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">学费收入（¥）</label>
                <input type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="必填" required value={newRecord.revenue}
                  onChange={(e) => setNewRecord({...newRecord, revenue: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">备注</label>
                <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="可选" value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors">
                提交到 {getBranchName(currentBranch)}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========== 删除确认弹窗 ========== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">确认删除</h3>
            <p className="text-sm text-slate-500 mb-6">此操作不可撤销，确定要删除这条记录吗？</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                取消
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 从其他门店复制数据弹窗 ========== */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">从其他门店复制数据</h3>
              <button onClick={() => setShowCopyModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <span className="text-slate-400 text-xl">✕</span>
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              将数据从源门店复制到 <strong>{getBranchName(currentBranch)}</strong>：
            </p>
            <div className="space-y-3">
              {BRANCHES.filter(b => b.id !== currentBranch).map(b => (
                <label key={b.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${copySourceBranch === b.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="copyBranch" value={b.id}
                    checked={copySourceBranch === b.id}
                    onChange={() => setCopySourceBranch(b.id)}
                    className="mr-3" />
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{b.name}</div>
                    <div className="text-xs text-slate-400">{b.id === 'main' ? '含原有历史账本' : '门店独立数据'}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCopyModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                取消
              </button>
              <button onClick={copyDataFromBranch} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                开始复制
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 系统提示弹窗 ========== */}
      {alertMessage && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">系统提示</h3>
            <p className="text-sm text-slate-500 mb-6">{alertMessage}</p>
            <button onClick={() => setAlertMessage('')} className="w-full px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium">
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
