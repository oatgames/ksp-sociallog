import React, { useEffect, useMemo, useState } from 'react';

type ClipboardItem = {
  id: string;
  label: string;
  value: string;
  createdAt: number;
};

const STORAGE_KEY = 'sociallog_clipboard_items';
const DEFAULT_ITEMS: ClipboardItem[] = [
  {
    id: 'clip_ksp_company_v1',
    label: 'ที่อยู่ภาษาไทย',
    value:
      'บริษัท เคเอสพี วู๊ดเด้นบ๊อกซ์จำกัด\n' +
      'ที่อยู่เลขที่ 55/1 ม.4 ต.เขาไม้แก้ว อ.บางละมุง จ.ชลบุรี 20150\n' +
      'เลขผู้เสียภาษี 0205565007591\n' +
      'โทร. 099-625-0616, 064-303-1583, 033-002-012',
    createdAt: 0,
  },
  {
    id: 'clip_ksp_company_en_v1',
    label: 'ที่อยู่ภาษาอังกฤษ',
    value:
      'KSP Wooden Box Co., Ltd.\n' +
      '55/1 Moo 4, Khao Mai Kaew, Banglamung, Chonburi 20150, Thailand\n' +
      '+66 99-625-0616, +66 64-303-1583, +66 33-002-012',
    createdAt: 0,
  },
  {
    id: 'clip_ksp_contact_v1',
    label: 'contact',
    value:
      'contact\n\n' +
      'www.kspwoodenbox.com\n' +
      'https://linktr.ee/kspwoodenbox\n' +
      'https://www.facebook.com/kspwoodenbox\n\n' +
      'Line Official ID : @kspwoodenbox\n' +
      'E-mail : contact@kspwoodenbox.com\n\n' +
      'โทร. 099-625-0616, 064-303-1583, 033-002-012',
    createdAt: 0,
  },
  {
    id: 'clip_ksp_jobpost_wood_v1',
    label: 'รับสมัครพนักงาน (ช่างไม้)',
    value:
      'KSP Wooden Box รับสมัครพนักงานประจำ/parttime/ฟรีแลนซ์\n' +
      'บริษัท รับผลิตและจำหน่ายกล่องไม้แพคเกจสินค้าจากไม้และงานไม้ฝีมือปราณีต\n\n' +
      '🔨 ช่างไม้ / ผู้ช่วยช่างไม้\n\n' +
      'รายได้\n' +
      '• ทดลองงาน 400 บาท/วัน\n' +
      '• ผ่านโปร 15,000 – 30,000 บาท/เดือน (พิจารณาตามความสามารถ)\n\n' +
      'เวลาทำงาน\n' +
      '• 08.00 – 17.00 น.\n' +
      '• หยุดสัปดาห์ละ 1 วัน เลือกวันหยุดได้\n\n' +
      'สำหรับผู้ที่ไม่มีมีประสบการณ์\n' +
      '• มีสอนงานให้ตั้งแต่พื้นฐาน\n' +
      '• ได้ฝึกใช้เครื่องมือช่างจริง\n' +
      '• มีพี่สอนงานใกล้ชิด\n' +
      '• พัฒนาได้จริง โตตามฝีมือ รายได้เพิ่มตามผลงาน\n' +
      '• ได้เก็บเกี่ยวประสบการณ์และทักษะงานไม้และงานฝีมือ\n\n' +
      '• ได้พัฒนาทักษะที่เอาไปต่อยอดได้\n\n' +
      '• ได้ฝึกคิดวิเคราะห์และแก้ปัญหางานที่มีรายละเอียดและความซับซ้อน\n\n' +
      'คุณสมบัติที่พื้นฐานที่ต้องการ:\n' +
      'ขยัน ใฝ่รู้ ไม่เป็นน้ำเต็มแก้ว\n' +
      'ไม่กลัวฝุ่น ไม่กลัวเลอะ\n' +
      'สายตาปกติ และใส่ใจในรายละเอียดของงาน\n' +
      'ทำงานเป็นทีม รับฟังกัน และยอมรับข้อผิดพลาดได้\n' +
      'คิดบวก มีความรับผิดชอบ\n' +
      'ไม่ดื่มเหล้า ไม่สูบบุหรี่\n\n' +
      '📍 สถานที่ทำงาน: เขาไม้แก้ว ชลบุรี\n' +
      'สนใจทักแชทหรือโทรได้เลย\n' +
      '033-002-012 / 064-303-1583\n' +
      'E-mail: contact@kspwoodenbox.com\n' +
      'Line : @kspwoodenbox',
    createdAt: 0,
  },
  {
    id: 'clip_ksp_jobpost_cnc_laser_v1',
    label: 'รับสมัครพนักงาน (CNC / Laser)',
    value:
      'KSP Wooden Box รับสมัครพนักงานประจำ/parttime/ฟรีแลนซ์\n' +
      'บริษัท รับผลิตและจำหน่ายกล่องไม้แพคเกจสินค้าจากไม้และงานไม้ฝีมือปราณีต\n\n' +
      'ตำแหน่ง:\n' +
      '🪚 CNC Operator / ผู้ช่วยช่าง CNC\n' +
      '🔦 CO₂ Laser Operator / ผู้ช่วยช่างเลเซอร์\n\n' +
      'รายได้\n' +
      '• ทดลองงาน 400 บาท/วัน\n' +
      '• ผ่านโปร 15,000 – 30,000 บาท/เดือน (พิจารณาตามความสามารถ)\n\n' +
      'เวลาทำงาน\n' +
      '• 08.00 – 17.00 น.\n' +
      '• หยุดสัปดาห์ละ 1 วัน เลือกวันหยุดได้\n' +
      '• parttime/ฟรีแลนซ์ เลือกเวลางานและวันหยุดตามตกลง\n\n' +
      'สำหรับผู้ที่ไม่มีมีประสบการณ์\n' +
      '• มีสอนงานให้ตั้งแต่พื้นฐาน\n' +
      '• ได้ทักษะ CNC / Laser ที่ใช้งานได้จริงติดตัว\n' +
      '• พัฒนาได้จริง โตตามฝีมือ รายได้เพิ่มตามผลงาน\n' +
      '• ได้เก็บเกี่ยวประสบการณ์และทักษะการทำงาน CNC / Laser\n\n' +
      '• ได้พัฒนาทักษะที่เอาสามารถไปต่อยอดได้\n\n' +
      'คุณสมบัติที่พื้นฐานที่ต้องการ:\n' +
      'ขยัน ใฝ่รู้ ไม่เป็นน้ำเต็มแก้ว\n' +
      'ไม่กลัวฝุ่น ไม่กลัวเสียงเครื่อง\n' +
      'ทำงานเป็นทีม รับฟังกัน และยอมรับข้อผิดพลาดได้\n' +
      'คิดบวก มีความรับผิดชอบ\n' +
      'ไม่ดื่มเหล้า ไม่สูบบุหรี่\n\n' +
      'คุณสมบัติด้านเทคนิค (เพิ่มเติม):\n' +
      '🪚 สำหรับ CNC Operator\n' +
      'ใช้คอมพิวเตอร์ได้ระดับพื้นฐาน\n' +
      'รู้จักหรือเคยใช้โปรแกรมออกแบบ/กัดงาน เช่น Aspire, SketchUp, AutoCAD\n' +
      'เข้าใจหลักการตั้งค่าความลึก ความเร็ว และลำดับการกัด\n\n' +
      '🔦 สำหรับ CO₂ Laser Operator\n' +
      'ใช้คอมพิวเตอร์และโปรแกรมออกแบบได้\n' +
      'รู้จักหรือเคยใช้ LaserCAD, RDWorks, Illustrator (AI), Photoshop (PS)\n' +
      'เข้าใจเรื่องขนาดไฟล์ วัสดุ และการตั้งค่ากำลังยิงของเครื่องเลเซอร์\n' +
      'ถ้ายังไม่เคยใช้มาก่อน — ไม่เป็นไร เราสอนให้ได้ ขอแค่ตั้งใจจริง\n\n' +
      '📍 สถานที่ทำงาน: เขาไม้แก้ว ชลบุรี\n' +
      'สนใจทักแชทหรือโทรได้เลย\n' +
      '033-002-012 / 080-922-1285\n' +
      'Line : @kspwoodenbox',
    createdAt: 0,
  },
  {
    id: 'clip_ksp_jobpost_admin_cs_v1',
    label: 'รับสมัครพนักงาน (Admin & Customer Service)',
    value:
      'KSP Wooden Box รับสมัครพนักงานประจำ/parttime/ฟรีแลนซ์\n' +
      'บริษัท รับผลิตและจำหน่ายกล่องไม้แพคเกจสินค้าจากไม้และงานไม้ฝีมือปราณีต\n\n' +
      'ตำแหน่ง: 🪶 Admin & Customer Service Representative\n' +
      '(เจ้าหน้าที่ธุรการและบริการลูกค้า)\n\n' +
      'รายได้\n' +
      '• ทดลองงาน 400 บาท/วัน\n' +
      '• ผ่านโปร 15,000 – 30,000 บาท/เดือน (พิจารณาตามความสามารถ)\n\n' +
      'เวลาทำงาน\n' +
      '• 08.00 – 17.00 น.\n' +
      '• หยุดสัปดาห์ละ 1 วัน เลือกวันหยุดได้\n' +
      '• parttime/ฟรีแลนซ์ เลือกเวลางานและวันหยุดตามตกลง\n\n' +
      'หน้าที่หลัก:\n' +
      'ตอบแชทและให้ข้อมูลลูกค้า (ผ่าน LINE, Facebook, Email)\n' +
      'ประสานงานกับฝ่ายผลิต ฝ่ายจัดส่ง และลูกค้า ออกเอกสาร\n' +
      'เช่น ใบเสนอราคา ใบสั่งผลิต ใบส่งของ ดูแลข้อมูลในระบบออนไลน์\n' +
      'และเอกสารงานประจำวัน\n\n' +
      'คุณสมบัติที่อยากเจอ:\n' +
      'ขยัน ใฝ่รู้ มีความรับผิดชอบ\n' +
      'พิมพ์ไทยได้คล่อง เขียนประโยคสุภาพ\n' +
      'ทำงานเป็นทีม และพร้อมเรียนรู้สิ่งใหม่\n' +
      'คิดบวก ยอมรับข้อผิดพลาด และพร้อมแก้ไข\n\n' +
      'คุณสมบัติด้านคอมพิวเตอร์ (จำเป็นมาก):\n' +
      'ใช้งานคอมพิวเตอร์ได้คล่อง ทั้ง Windows / Google Workspace (Docs, Sheets, Drive)\n' +
      'เข้าใจพื้นฐาน Email, Facebook Page, LINE OA, Canva สามารถใช้โปรแกรมหรือเว็บแอปพื้นฐาน เช่น Google Sheets (กรอก-คำนวณข้อมูล) Google Drive (เก็บไฟล์ แชร์เอกสาร) Canva / Photoshop / Illustrator (จัดภาพหรือทำเอกสารเบื้องต้น)\n\n' +
      'ทักษะที่คุณจะได้รับ\n' +
      '• ได้พัฒนาทักษะการสื่อสาร\n' +
      '• ได้เรียนรู้การทำงานกับทีมผลิตและกระบวนการธุรกิจครบวงจร\n' +
      '• ได้ประสบการณ์งานธุรกิจจริง ใช้ต่อยอดสายงาน Admin / Sales / Operation ได้\n' +
      '• ได้ฝึกคิดวิเคราะห์และแก้ปัญหา ไม่ใช่แค่ตอบแชท\n' +
      '• ได้พัฒนาทักษะที่เอาไปต่อยอดได้\n' +
      '• ได้ฝึกความเป็นมืออาชีพในการสื่อสารกับลูกค้า\n\n' +
      '📍 สถานที่ทำงาน: เขาไม้แก้ว ชลบุรี\n' +
      'สนใจทักแชทหรือโทรได้เลย\n' +
      '033-002-012 / 080-922-1285\n' +
      'Line : @kspwoodenbox\n\n' +
      'ตำแหน่งนี้มีโอกาสเติบโตตามความสามารถ ไม่จำกัดแค่แอดมิน',
    createdAt: 0,
  },
];

const loadItems = (): ClipboardItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i && typeof i.label === 'string' && typeof i.value === 'string');
  } catch {
    return [];
  }
};

const saveItems = (items: ClipboardItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const ClipboardTab: React.FC = () => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadItems();
    if (existing.length > 0) {
      setItems(existing);
    } else {
      setItems(DEFAULT_ITEMS);
    }
  }, []);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.createdAt - a.createdAt),
    [items]
  );

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 3000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        setCopiedId(id);
        setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 3000);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">กล่องคัดลอกข้อมูลทั่วไป</h2>
        <p className="text-sm text-slate-500">ข้อมูลที่ใช้บ่อย พร้อมปุ่มคัดลอกทันที</p>
      </div>

      {sortedItems.length === 0 ? (
        <div className="text-center text-slate-400 text-sm py-10">
          ยังไม่มีข้อมูลที่บันทึกไว้
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-4 [column-fill:balance]">
          {sortedItems.map((item) => (
            <div key={item.id} className="mb-4 break-inside-avoid bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h-1a2 2 0 0 0-4 0H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <path d="M12 11h4M12 15h4M8 11h.01M8 15h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-800">{item.label}</h3>
                  <div className="mt-2 text-sm text-slate-600 whitespace-pre-wrap break-words">
                    {item.value}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleCopy(item.value, item.id)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                    aria-label="คัดลอก"
                    title="คัดลอก"
                  >
                    {copiedId === item.id ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 4h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                        <path d="M6 8H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
