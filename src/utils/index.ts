/**
 * 日期格式化
 * @param time 日期
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(time: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return '';

  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const formatObj = {
    YYYY: year.toString(),
    MM: month < 10 ? '0' + month : month.toString(),
    DD: day < 10 ? '0' + day : day.toString(),
    HH: hours < 10 ? '0' + hours : hours.toString(),
    mm: minutes < 10 ? '0' + minutes : minutes.toString(),
    ss: seconds < 10 ? '0' + seconds : seconds.toString(),
  };

  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (result) => {
    return formatObj[result as keyof typeof formatObj];
  });
}

/**
 * 获取分页范围
 * @param total 总页数
 * @param current 当前页
 * @param displayCount 显示页码数
 * @returns 页码范围数组
 */
export function getPageRange(total: number, current: number, displayCount = 5) {
  if (displayCount % 2 === 0) {
    displayCount++;
  }

  const halfDisplay = Math.floor(displayCount / 2);
  let startPage = Math.max(1, current - halfDisplay);
  let endPage = Math.min(total, current + halfDisplay);

  if (startPage > 1 && endPage < total) {
    if (current - startPage < halfDisplay) {
      endPage = Math.min(total, endPage + (halfDisplay - (current - startPage)));
    } else if (endPage - current < halfDisplay) {
      startPage = Math.max(1, startPage - (halfDisplay - (endPage - current)));
    }
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
}

/**
 * 文本截断
 * @param text 文本内容
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * 小说类型映射
 */
export const novelTypeMap = {
  1: '正文',
  2: '彩蛋'
};

/**
 * 获取小说类型文本
 * @param type 类型数值
 * @returns 类型文本
 */
export function getNovelTypeText(type: number): string {
  return novelTypeMap[type as keyof typeof novelTypeMap] || '未知';
}

/**
 * 显示操作结果消息
 * @param message 消息内容
 * @param type 消息类型
 */
export function showMessage(message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') {
  // 将在Element Plus集成后实现
  console.log(`${type}: ${message}`);
}

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param delay 延迟时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param func 要执行的函数
 * @param delay 延迟时间
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
} 