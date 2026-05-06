export const CITIES = [
  { code: "A", name: "臺北市", lat: 25.0330, lng: 121.5654 },
  { code: "B", name: "臺中市", lat: 24.1477, lng: 120.6736 },
  { code: "C", name: "基隆市", lat: 25.1283, lng: 121.7419 },
  { code: "D", name: "臺南市", lat: 22.9997, lng: 120.2270 },
  { code: "E", name: "高雄市", lat: 22.6273, lng: 120.3014 },
  { code: "F", name: "新北市", lat: 25.0117, lng: 121.4658 },
  { code: "G", name: "宜蘭縣", lat: 24.7021, lng: 121.7377 },
  { code: "H", name: "桃園市", lat: 24.9936, lng: 121.3010 },
  { code: "I", name: "嘉義市", lat: 23.4818, lng: 120.4536 },
  { code: "J", name: "新竹縣", lat: 24.8274, lng: 121.0129 },
  { code: "K", name: "苗栗縣", lat: 24.5601, lng: 120.8209 },
  { code: "M", name: "南投縣", lat: 23.9037, lng: 120.6868 },
  { code: "N", name: "彰化縣", lat: 24.0519, lng: 120.5161 },
  { code: "O", name: "新竹市", lat: 24.8138, lng: 120.9675 },
  { code: "P", name: "雲林縣", lat: 23.7092, lng: 120.4313 },
  { code: "Q", name: "嘉義縣", lat: 23.4518, lng: 120.2555 },
  { code: "T", name: "屏東縣", lat: 22.6741, lng: 120.4880 },
  { code: "U", name: "花蓮縣", lat: 23.9772, lng: 121.6044 },
  { code: "V", "name": "臺東縣", lat: 22.7554, lng: 121.1495 },
  { code: "W", "name": "金門縣", lat: 24.4368, lng: 118.3186 },
  { code: "X", "name": "澎湖縣", lat: 23.5712, lng: 119.5793 },
  { code: "Z", "name": "連江縣", lat: 26.1558, lng: 119.9298 },
];

export const TRANSACTION_TYPES = [
  { code: "A", name: "買賣",   qryType: "sale",  tableId: "saleList_table"  },
  { code: "B", name: "預售屋", qryType: "p", tableId: "pList_table" },
  { code: "C", name: "租賃",   qryType: "rent", tableId: "rentList_table" },
];

export const PROPERTY_TYPES = [
  { code: "house",         name: "房地",    ptypeCodes: ["1", "2"]         },
  { code: "house_parking", name: "房地(車)", ptypeCodes: ["1", "2", "5"]    },
  { code: "land",          name: "土地",    ptypeCodes: ["3"]              },
  { code: "building",      name: "建物",    ptypeCodes: ["4"]              },
  { code: "parking",       name: "車位",    ptypeCodes: ["5"]              },
];

export const PRICE_RANGES = [
  { label: "全部", min: 0, max: Infinity },
  { label: "500萬以下", min: 0, max: 5000000 },
  { label: "500-1000萬", min: 5000000, max: 10000000 },
  { label: "1000-2000萬", min: 10000000, max: 20000000 },
  { label: "2000-5000萬", min: 20000000, max: 50000000 },
  { label: "5000萬以上", min: 50000000, max: Infinity },
];

export const AREA_RANGES = [
  { label: "全部", min: 0, max: Infinity },
  { label: "20坪以下", min: 0, max: 20 },
  { label: "20-40坪", min: 20, max: 40 },
  { label: "40-60坪", min: 40, max: 60 },
  { label: "60-80坪", min: 60, max: 80 },
  { label: "80坪以上", min: 80, max: Infinity },
];

export const UNIT_PRICE_RANGES = [
  { label: "全部", min: 0, max: Infinity },
  { label: "10萬以下/坪", min: 0, max: 100000 },
  { label: "10-30萬/坪", min: 100000, max: 300000 },
  { label: "30-50萬/坪", min: 300000, max: 500000 },
  { label: "50-100萬/坪", min: 500000, max: 1000000 },
  { label: "100萬以上/坪", min: 1000000, max: Infinity },
];

export interface District {
  code: string;
  name: string;
  lat?: number;
  lng?: number;
}

export const CITY_DISTRICTS: Record<string, District[]> = {
  "基隆市": [{"code":"C02","name":"七堵區"},{"code":"C05","name":"中山區"},{"code":"C01","name":"中正區"},{"code":"C04","name":"仁愛區"},{"code":"C06","name":"安樂區"},{"code":"C07","name":"信義區"},{"code":"C03","name":"暖暖區"}],
  "臺北市": [
    {"code":"A15","name":"士林區", "lat": 25.0901, "lng": 121.5245},
    {"code":"A09","name":"大同區", "lat": 25.0631, "lng": 121.5133},
    {"code":"A02","name":"大安區", "lat": 25.0263, "lng": 121.5434},
    {"code":"A10","name":"中山區", "lat": 25.0685, "lng": 121.5333},
    {"code":"A03","name":"中正區", "lat": 25.0324, "lng": 121.5190},
    {"code":"A14","name":"內湖區", "lat": 25.0835, "lng": 121.5891},
    {"code":"A11","name":"文山區", "lat": 24.9891, "lng": 121.5586},
    {"code":"A16","name":"北投區", "lat": 25.1321, "lng": 121.5015},
    {"code":"A01","name":"松山區", "lat": 25.0592, "lng": 121.5575},
    {"code":"A17","name":"信義區", "lat": 25.0286, "lng": 121.5671},
    {"code":"A13","name":"南港區", "lat": 25.0521, "lng": 121.6070},
    {"code":"A05","name":"萬華區", "lat": 25.0353, "lng": 121.4997}
  ],
  "新北市": [
    {"code":"F32","name":"八里區", "lat": 25.1465, "lng": 121.3995},
    {"code":"F30","name":"三芝區", "lat": 25.2582, "lng": 121.5005},
    {"code":"F05","name":"三重區", "lat": 25.0624, "lng": 121.4871},
    {"code":"F15","name":"三峽區", "lat": 24.9351, "lng": 121.3688},
    {"code":"F19","name":"土城區", "lat": 24.9723, "lng": 121.4442},
    {"code":"F18","name":"中和區", "lat": 24.9961, "lng": 121.5034},
    {"code":"F03","name":"五股區", "lat": 25.0844, "lng": 121.4379},
    {"code":"F22","name":"平溪區", "lat": 25.0331, "lng": 121.7381},
    {"code":"F33","name":"永和區", "lat": 25.0076, "lng": 121.5136},
    {"code":"F31","name":"石門區", "lat": 25.2902, "lng": 121.5684},
    {"code":"F08","name":"石碇區", "lat": 24.9915, "lng": 121.6631},
    {"code":"F28","name":"汐止區", "lat": 25.0620, "lng": 121.6591},
    {"code":"F10","name":"坪林區", "lat": 24.9372, "lng": 121.7112},
    {"code":"F02","name":"林口區", "lat": 25.0775, "lng": 121.3927},
    {"code":"F14","name":"板橋區", "lat": 25.0117, "lng": 121.4658},
    {"code":"F25","name":"金山區", "lat": 25.2219, "lng": 121.6366},
    {"code":"F06","name":"泰山區", "lat": 25.0583, "lng": 121.4316},
    {"code":"F11","name":"烏來區", "lat": 24.8647, "lng": 121.5510},
    {"code":"F24","name":"貢寮區", "lat": 25.0184, "lng": 121.9443},
    {"code":"F27","name":"淡水區", "lat": 25.1707, "lng": 121.4414},
    {"code":"F09","name":"深坑區", "lat": 24.9982, "lng": 121.6155},
    {"code":"F07","name":"新店區", "lat": 24.9675, "lng": 121.5411},
    {"code":"F01","name":"新莊區", "lat": 25.0347, "lng": 121.4429},
    {"code":"F21","name":"瑞芳區", "lat": 25.1089, "lng": 121.8051},
    {"code":"F26","name":"萬里區", "lat": 25.1741, "lng": 121.6888},
    {"code":"F17","name":"樹林區", "lat": 24.9912, "lng": 121.4241},
    {"code":"F23","name":"雙溪區", "lat": 25.0024, "lng": 121.8651},
    {"code":"F04","name":"蘆洲區", "lat": 25.0849, "lng": 121.4735},
    {"code":"F16","name":"鶯歌區", "lat": 24.9547, "lng": 121.3541}
  ],
  "桃園市": [
    {"code":"H01","name":"桃園區", "lat": 24.9936, "lng": 121.3010},
    {"code":"H03","name":"中壢區", "lat": 24.9605, "lng": 121.2246},
    {"code":"H08","name":"八德區", "lat": 24.9298, "lng": 121.2961},
    {"code":"H10","name":"平鎮區", "lat": 24.9452, "lng": 121.2185},
    {"code":"H07","name":"龜山區", "lat": 25.0006, "lng": 121.3392},
    {"code":"H05","name":"蘆竹區", "lat": 25.0456, "lng": 121.2917},
    {"code":"H06","name":"大園區", "lat": 25.0645, "lng": 121.2001},
    {"code":"H02","name":"大溪區", "lat": 24.8812, "lng": 121.2854},
    {"code":"H04","name":"楊梅區", "lat": 24.9123, "lng": 121.1456},
    {"code":"H09","name":"龍潭區", "lat": 24.8631, "lng": 121.2162},
    {"code":"H11","name":"新屋區", "lat": 24.9723, "lng": 121.1051},
    {"code":"H12","name":"觀音區", "lat": 25.0345, "lng": 121.0821}
  ],
  "臺中市": [
    {"code":"B01","name":"中區", "lat": 24.1428, "lng": 120.6826},
    {"code":"B02","name":"東區", "lat": 24.1361, "lng": 120.6926},
    {"code":"B03","name":"南區", "lat": 24.1161, "lng": 120.6626},
    {"code":"B04","name":"西區", "lat": 24.1415, "lng": 120.6713},
    {"code":"B05","name":"北區", "lat": 24.1561, "lng": 120.6811},
    {"code":"B06","name":"西屯區", "lat": 24.1627, "lng": 120.6403},
    {"code":"B07","name":"南屯區", "lat": 24.1378, "lng": 120.6397},
    {"code":"B08","name":"北屯區", "lat": 24.1659, "lng": 120.7065},
    {"code":"B09","name":"豐原區", "lat": 24.2531, "lng": 120.7185},
    {"code":"B10","name":"東勢區", "lat": 24.2584, "lng": 120.8273},
    {"code":"B11","name":"大甲區", "lat": 24.3475, "lng": 120.6226},
    {"code":"B12","name":"清水區", "lat": 24.2685, "lng": 120.5726},
    {"code":"B13","name":"沙鹿區", "lat": 24.2335, "lng": 120.5626},
    {"code":"B14","name":"梧棲區", "lat": 24.2555, "lng": 120.5326},
    {"code":"B15","name":"后里區", "lat": 24.3055, "lng": 120.7126}
  ],
  "南投縣": [{"code":"M08","name":"中寮鄉"},{"code":"M13","name":"仁愛鄉"},{"code":"M11","name":"水里鄉"},{"code":"M06","name":"名間鄉"},{"code":"M04","name":"竹山鎮"},{"code":"M12","name":"信義鄉"},{"code":"M01","name":"南投市"},{"code":"M02","name":"埔里鎮"},{"code":"M03","name":"草屯鎮"},{"code":"M10","name":"國姓鄉"},{"code":"M09","name":"魚池鄉"},{"code":"M07","name":"鹿谷鄉"},{"code":"M05","name":"集集鎮"}],
  "彰化縣": [{"code":"N20","name":"二水鄉"},{"code":"N08","name":"二林鎮"},{"code":"N15","name":"大村鄉"},{"code":"N24","name":"大城鄉"},{"code":"N04","name":"北斗鎮"},{"code":"N18","name":"永靖鄉"},{"code":"N07","name":"田中鎮"},{"code":"N21","name":"田尾鄉"},{"code":"N25","name":"竹塘鄉"},{"code":"N10","name":"伸港鄉"},{"code":"N12","name":"秀水鄉"},{"code":"N03","name":"和美鎮"},{"code":"N19","name":"社頭鄉"},{"code":"N23","name":"芳苑鄉"},{"code":"N13","name":"花壇鄉"},{"code":"N14","name":"芬園鄉"},{"code":"N05","name":"員林市"},{"code":"N17","name":"埔心鄉"},{"code":"N16","name":"埔鹽鄉"},{"code":"N22","name":"埤頭鄉"},{"code":"N02","name":"鹿港鎮"},{"code":"N26","name":"溪州鄉"},{"code":"N06","name":"溪湖鎮"},{"code":"N01","name":"彰化市"},{"code":"N11","name":"福興鄉"},{"code":"N09","name":"線西鄉"}],
  "雲林縣": [{"code":"P11","name":"二崙鄉"},{"code":"P19","name":"口湖鄉"},{"code":"P05","name":"土庫鎮"},{"code":"P08","name":"大埤鄉"},{"code":"P17","name":"元長鄉"},{"code":"P01","name":"斗六市"},{"code":"P02","name":"斗南鎮"},{"code":"P20","name":"水林鄉"},{"code":"P06","name":"北港鎮"},{"code":"P07","name":"古坑鄉"},{"code":"P16","name":"台西鄉"},{"code":"P18","name":"四湖鄉"},{"code":"P04","name":"西螺鎮"},{"code":"P14","name":"東勢鄉"},{"code":"P10","name":"林內鄉"},{"code":"P03","name":"虎尾鎮"},{"code":"P12","name":"崙背鄉"},{"code":"P13","name":"麥寮鄉"},{"code":"P15","name":"褒忠鄉"},{"code":"P09","name":"莿桐鄉"}],
  "嘉義市": [{"code":"I01","name":"嘉義市"},{"code":"I02","name":"東區"},{"code":"I03","name":"西區"}],
  "嘉義縣": [{"code":"Q04","name":"大林鎮"},{"code":"Q18","name":"大埔鄉"},{"code":"Q14","name":"中埔鄉"},{"code":"Q08","name":"六腳鄉"},{"code":"Q12","name":"太保市"},{"code":"Q13","name":"水上鄉"},{"code":"Q03","name":"布袋鎮"},{"code":"Q05","name":"民雄鄉"},{"code":"Q02","name":"朴子市"},{"code":"Q15","name":"竹崎鄉"},{"code":"Q09","name":"東石鄉"},{"code":"Q20","name":"阿里山鄉"},{"code":"Q16","name":"梅山鄉"},{"code":"Q11","name":"鹿草鄉"},{"code":"Q17","name":"番路鄉"},{"code":"Q07","name":"新港鄉"},{"code":"Q06","name":"溪口鄉"},{"code":"Q10","name":"義竹鄉"}],
  "臺南市": [{"code":"D22","name":"七股區"},{"code":"D16","name":"下營區"},{"code":"D19","name":"大內區"},{"code":"D30","name":"山上區"},{"code":"D08","name":"中西區"},{"code":"D32","name":"仁德區"},{"code":"D17","name":"六甲區"},{"code":"D24","name":"北門區"},{"code":"D04","name":"北區"},{"code":"D31","name":"左鎮區"},{"code":"D39","name":"永康區"},{"code":"D36","name":"玉井區"},{"code":"D12","name":"白河區"},{"code":"D07","name":"安平區"},{"code":"D29","name":"安定區"},{"code":"D06","name":"安南區"},{"code":"D21","name":"西港區"},{"code":"D20","name":"佳里區"},{"code":"D18","name":"官田區"},{"code":"D14","name":"東山區"},{"code":"D01","name":"東區"},{"code":"D38","name":"南化區"},{"code":"D02","name":"南區"},{"code":"D13","name":"後壁區"},{"code":"D11","name":"柳營區"},{"code":"D23","name":"將軍區"},{"code":"D15","name":"麻豆區"},{"code":"D27","name":"善化區"},{"code":"D26","name":"新化區"},{"code":"D28","name":"新市區"},{"code":"D09","name":"新營區"},{"code":"D37","name":"楠西區"},{"code":"D25","name":"學甲區"},{"code":"D35","name":"龍崎區"},{"code":"D33","name":"歸仁區"},{"code":"D34","name":"關廟區"},{"code":"D10","name":"鹽水區"}],
  "高雄市": [{"code":"E05","name":"三民區"},{"code":"E16","name":"大社區"},{"code":"E14","name":"大寮區"},{"code":"E15","name":"大樹區"},{"code":"E11","name":"小港區"},{"code":"E17","name":"仁武區"},{"code":"E35","name":"內門區"},{"code":"E32","name":"六龜區"},{"code":"E03","name":"左營區"},{"code":"E27","name":"永安區"},{"code":"E22","name":"田寮區"},{"code":"E33","name":"甲仙區"},{"code":"E34","name":"杉林區"},{"code":"E38","name":"那瑪夏區"},{"code":"E19","name":"岡山區"},{"code":"E13","name":"林園區"},{"code":"E23","name":"阿蓮區"},{"code":"E07","name":"前金區"},{"code":"E09","name":"前鎮區"},{"code":"E31","name":"美濃區"},{"code":"E26","name":"茄萣區"},{"code":"E36","name":"茂林區"},{"code":"E08","name":"苓雅區"},{"code":"E37","name":"桃源區"},{"code":"E29","name":"梓官區"},{"code":"E18","name":"鳥松區"},{"code":"E25","name":"湖內區"},{"code":"E06","name":"新興區"},{"code":"E04","name":"楠梓區"},{"code":"E24","name":"路竹區"},{"code":"E02","name":"鼓山區"},{"code":"E30","name":"旗山區"},{"code":"E10","name":"旗津區"},{"code":"E12","name":"鳳山區"},{"code":"E20","name":"橋頭區"},{"code":"E21","name":"燕巢區"},{"code":"E28","name":"彌陀區"},{"code":"E01","name":"鹽埕區"}],
  "屏東縣": [{"code":"T08","name":"九如鄉"},{"code":"T26","name":"三地門鄉"},{"code":"T13","name":"內埔鄉"},{"code":"T14","name":"竹田鄉"},{"code":"T33","name":"牡丹鄉"},{"code":"T23","name":"車城鄉"},{"code":"T09","name":"里港鄉"},{"code":"T21","name":"佳冬鄉"},{"code":"T30","name":"來義鄉"},{"code":"T25","name":"枋山鄉"},{"code":"T16","name":"枋寮鄉"},{"code":"T03","name":"東港鎮"},{"code":"T19","name":"林邊鄉"},{"code":"T06","name":"長治鄉"},{"code":"T20","name":"南州鄉"},{"code":"T01","name":"屏東市"},{"code":"T04","name":"恆春鎮"},{"code":"T31","name":"春日鄉"},{"code":"T18","name":"崁頂鄉"},{"code":"T29","name":"泰武鄉"},{"code":"T22","name":"琉球鄉"},{"code":"T11","name":"高樹鄉"},{"code":"T15","name":"新埤鄉"},{"code":"T17","name":"新園鄉"},{"code":"T32","name":"獅子鄉"},{"code":"T05","name":"萬丹鄉"},{"code":"T12","name":"萬巒鄉"},{"code":"T24","name":"滿州鄉"},{"code":"T28","name":"瑪家鄉"},{"code":"T02","name":"潮州鎮"},{"code":"T27","name":"霧臺鄉"},{"code":"T07","name":"麟洛鄉"},{"code":"T10","name":"鹽埔鄉"}],
  "宜蘭縣": [{"code":"G10","name":"三星鄉"},{"code":"G11","name":"大同鄉"},{"code":"G07","name":"五結鄉"},{"code":"G08","name":"冬山鄉"},{"code":"G04","name":"壯圍鄉"},{"code":"G01","name":"宜蘭市"},{"code":"G12","name":"南澳鄉"},{"code":"G05","name":"員山鄉"},{"code":"G02","name":"頭城鎮"},{"code":"G03","name":"礁溪鄉"},{"code":"G06","name":"羅東鎮"},{"code":"G09","name":"蘇澳鎮"}],
  "花蓮縣": [{"code":"U03","name":"玉里鎮"},{"code":"U02","name":"光復鄉"},{"code":"U05","name":"吉安鄉"},{"code":"U11","name":"秀林鄉"},{"code":"U13","name":"卓溪鄉"},{"code":"U01","name":"花蓮市"},{"code":"U10","name":"富里鄉"},{"code":"U04","name":"新城鄉"},{"code":"U09","name":"瑞穗鄉"},{"code":"U12","name":"萬榮鄉"},{"code":"U06","name":"壽豐鄉"},{"code":"U07","name":"鳳林鎮"},{"code":"U08","name":"豐濱鄉"}],
  "臺東縣": [{"code":"V05","name":"大武鄉"},{"code":"V06","name":"太麻里鄉"},{"code":"V01","name":"台東市"},{"code":"V02","name":"成功鎮"},{"code":"V10","name":"池上鄉"},{"code":"V04","name":"卑南鄉"},{"code":"V12","name":"延平鄉"},{"code":"V07","name":"東河鄉"},{"code":"V15","name":"金峰鄉"},{"code":"V08","name":"長濱鄉"},{"code":"V13","name":"海端鄉"},{"code":"V09","name":"鹿野鄉"},{"code":"V14","name":"達仁鄉"},{"code":"V11","name":"綠島鄉"},{"code":"V03","name":"關山鎮"},{"code":"V16","name":"蘭嶼鄉"}],
  "澎湖縣": [{"code":"X06","name":"七美鄉"},{"code":"X03","name":"白沙鄉"},{"code":"X04","name":"西嶼鄉"},{"code":"X01","name":"馬公市"},{"code":"X05","name":"望安鄉"},{"code":"X02","name":"湖西鄉"}],
  "金門縣": [{"code":"W02","name":"金沙鎮"},{"code":"W03","name":"金城鎮"},{"code":"W01","name":"金湖鎮"},{"code":"W04","name":"金寧鄉"},{"code":"W05","name":"烈嶼鄉"},{"code":"W06","name":"烏坵鄉"}],
  "連江縣": [{"code":"Z02","name":"北竿鄉"},{"code":"Z04","name":"東引鄉"},{"code":"Z01","name":"南竿鄉"},{"code":"Z03","name":"莒光鄉"}]
};

