const defaultProducts = [
{id:1,name:"コーヒー",price:400,category:"ドリンク",stock:30},
{id:2,name:"紅茶",price:350,category:"ドリンク",stock:25},
{id:5,name:"ジュース",price:300,category:"ドリンク",stock:20},
{id:7,name:"カフェラテ",price:450,category:"ドリンク",stock:20},
{id:8,name:"抹茶ラテ",price:450,category:"ドリンク",stock:18},
{id:9,name:"アイスコーヒー",price:400,category:"ドリンク",stock:25},
{id:10,name:"レモネード",price:350,category:"ドリンク",stock:20},
{id:11,name:"ミルクティー",price:400,category:"ドリンク",stock:20},
{id:4,name:"サンドイッチ",price:450,category:"フード",stock:20},
{id:12,name:"ホットドッグ",price:400,category:"フード",stock:15},
{id:13,name:"トースト",price:300,category:"フード",stock:20},
{id:14,name:"ピザトースト",price:450,category:"フード",stock:15},
{id:15,name:"フライドポテト",price:350,category:"フード",stock:20},
{id:16,name:"ホットサンド",price:500,category:"フード",stock:15},
{id:3,name:"ケーキ",price:500,category:"デザート",stock:15},
{id:6,name:"クッキー",price:200,category:"デザート",stock:30},
{id:17,name:"プリン",price:300,category:"デザート",stock:18},
{id:18,name:"チョコレートケーキ",price:550,category:"デザート",stock:12},
{id:19,name:"ドーナツ",price:250,category:"デザート",stock:20},
{id:20,name:"アイスクリーム",price:350,category:"デザート",stock:15},
{id:21,name:"フルーツタルト",price:500,category:"デザート",stock:10}
];
function loadData(key,fallback){try{const x=localStorage.getItem(key);return x?JSON.parse(x):fallback}catch(e){return fallback}}
const savedProducts=loadData("cafeProducts",[]);
let products=defaultProducts.map(p=>{const old=savedProducts.find(x=>x.id===p.id);return old?{...p,...old}:{...p}});
savedProducts.forEach(p=>{if(!products.some(x=>x.id===p.id))products.push(p)});
let cart=loadData("cafeCart",[]);
let orderHistory=loadData("cafeHistory",[]);
let selectedCategory="すべて";
const yen=n=>"¥"+Number(n).toLocaleString("ja-JP");
function saveData(){localStorage.setItem("cafeProducts",JSON.stringify(products));localStorage.setItem("cafeCart",JSON.stringify(cart));localStorage.setItem("cafeHistory",JSON.stringify(orderHistory))}
function normalize(s){return String(s??"").normalize("NFKC").toLocaleLowerCase("ja").replace(/\s+/g,"")}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function showScreen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));document.querySelectorAll(".nav-button").forEach(b=>b.classList.toggle("active",b.dataset.screen===id));window.scrollTo({top:0,behavior:"smooth"});if(id==="paymentScreen"){updatePaymentMethod();updateChange()}}
document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.screen)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.go)));
function renderProducts(){
 const word=normalize(document.getElementById("search").value);
 const shown=products.filter(p=>(selectedCategory==="すべて"||p.category===selectedCategory)&&(!word||normalize(p.name+p.category).includes(word)));
 document.getElementById("searchMessage").textContent=`検索結果：${shown.length}件`;
 document.getElementById("products").innerHTML=shown.length?shown.map(p=>`<article class="product"><div class="product-photo">商品画像</div><div class="product-info"><div class="product-name">${safe(p.name)}</div><div class="price">${yen(p.price)}</div><div class="stock">在庫：${p.stock}</div></div><button class="add" data-add="${p.id}" ${p.stock<=0?"disabled":""}>追加</button></article>`).join(""):'<p class="empty">商品が見つかりません。商品名を確認してください。</p>';
}
function total(){return cart.reduce((s,i)=>s+i.price*i.quantity,0)}
function renderCart(){
 document.getElementById("cartBadge").textContent=cart.reduce((s,i)=>s+i.quantity,0);
 document.getElementById("cart").innerHTML=cart.length?cart.map(i=>`<div class="order-row"><div><div class="order-name">${safe(i.name)}</div><div class="order-detail">${yen(i.price)} × ${i.quantity}</div><div class="qty-controls"><button data-minus="${i.id}">−</button><span>${i.quantity}</span><button data-plus="${i.id}">＋</button><button class="remove" data-remove="${i.id}">削除</button></div></div><div class="order-price">${yen(i.price*i.quantity)}</div></div>`).join(""):'<p class="empty">商品を追加してください。</p>';
 document.getElementById("total").textContent=yen(total());document.getElementById("paymentTotal").textContent=yen(total());updateChange();
}
function updatePaymentMethod(){
 const method=document.getElementById("paymentMethod").value;
 const cash=method==="現金";
 document.getElementById("cashPaymentArea").style.display=cash?"block":"none";
 const notes={"現金":"現金でお支払いします。","クレジットカード":"クレジットカードで合計金額を支払うデモです。","電子マネー":"電子マネーで合計金額を支払うデモです。","ポイントカード":"ポイントを使って合計金額を支払うデモです。実際のポイント残高とは連携していません。"};
 document.getElementById("paymentMethodNote").textContent=notes[method]||"";
 updateChange();
}
function updateChange(){const method=document.getElementById("paymentMethod").value;const t=document.getElementById("payment").value;const diff=(t===""?0:Number(t))-total();document.getElementById("changeLabel").textContent=diff<0?"不足金額":"お釣り";document.getElementById("change").textContent=yen(Math.abs(diff));if(method!=="現金")document.getElementById("change").textContent=yen(0)}
function renderHistory(){document.getElementById("history").innerHTML=orderHistory.length?orderHistory.map((o,i)=>`<article class="history-item"><strong>注文 ${orderHistory.length-i}</strong>　${safe(o.date)}<br>${o.items.map(x=>`${safe(x.name)} × ${x.quantity}`).join("、")}<br>合計：<strong>${yen(o.total)}</strong>　支払方法：${safe(o.method||"現金")}　${(o.method||"現金")==="現金"?`支払：${yen(o.payment)}　お釣り：${yen(o.change)}`:"支払額："+yen(o.payment)}</article>`).join(""):'<p class="empty">注文履歴はありません。</p>'}
function notice(s,id="notice"){document.getElementById(id).textContent=s}
function add(id){const p=products.find(x=>x.id===id);if(!p||p.stock<=0)return;const item=cart.find(x=>x.id===id);if(item){if(item.quantity>=p.stock){notice("在庫数を超えて注文できません。");return}item.quantity++}else cart.push({id:p.id,name:p.name,price:p.price,quantity:1});saveData();renderCart();renderProducts();notice(p.name+"を注文に追加しました。")}
function quantity(id,d){const item=cart.find(x=>x.id===id),p=products.find(x=>x.id===id);if(!item)return;const n=item.quantity+d;if(n<=0)cart=cart.filter(x=>x.id!==id);else if(!p||n>p.stock){notice("在庫数を超えて注文できません。");return}else item.quantity=n;saveData();renderCart();renderProducts()}
document.getElementById("categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;selectedCategory=b.dataset.category;document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
document.getElementById("search").addEventListener("input",renderProducts);
document.getElementById("products").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)add(Number(b.dataset.add))});
document.getElementById("cart").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.plus)quantity(Number(b.dataset.plus),1);if(b.dataset.minus)quantity(Number(b.dataset.minus),-1);if(b.dataset.remove){cart=cart.filter(x=>x.id!==Number(b.dataset.remove));saveData();renderCart();renderProducts()}});
document.getElementById("payment").addEventListener("input",updateChange);
document.getElementById("paymentMethod").addEventListener("change",updatePaymentMethod);
document.getElementById("checkout").addEventListener("click",()=>{
 if(!cart.length){alert("注文する商品を追加してください。");showScreen("productsScreen");return}
 const sum=total(),method=document.getElementById("paymentMethod").value,raw=document.getElementById("payment").value;
 let pay=sum,change=0;
 if(method==="現金"){
  pay=Number(raw);
  if(raw===""||!Number.isFinite(pay)||pay<sum){alert("お預かり金額が合計金額より少ないです。金額を確認してください。");return}
  change=pay-sum;
 }
 orderHistory.unshift({date:new Date().toLocaleString("ja-JP"),items:cart.map(x=>({...x})),total:sum,payment:pay,change,method});
 cart.forEach(i=>{const p=products.find(x=>x.id===i.id);if(p)p.stock=Math.max(0,p.stock-i.quantity)});
 cart=[];document.getElementById("payment").value="";saveData();renderProducts();renderCart();renderHistory();notice("注文を確定しました。","paymentNotice");alert(`注文を確定しました。\\n合計：${yen(sum)}\\nお釣り：${yen(pay-sum)}`);showScreen("historyScreen");
});
document.getElementById("clearHistory").addEventListener("click",()=>{if(confirm("注文履歴を削除しますか？")){orderHistory=[];saveData();renderHistory()}});
renderProducts();renderCart();renderHistory();showScreen("productsScreen");

// 管理者機能（ブラウザ内で動作する学習用デモ）
let adminLoggedIn = false;
const adminNav = document.getElementById("adminNav");
adminNav.addEventListener("click", () => {
  if (adminLoggedIn) { showScreen("adminScreen"); renderAdmin(); }
  else { document.getElementById("adminLoginError").textContent=""; showScreen("adminLoginScreen"); }
});
document.getElementById("adminLoginButton").addEventListener("click", () => {
  const user=document.getElementById("adminUser").value.trim();
  const pass=document.getElementById("adminPass").value;
  if(user==="admin" && pass==="admin123") { adminLoggedIn=true; document.getElementById("adminPass").value=""; showScreen("adminScreen"); renderAdmin(); }
  else document.getElementById("adminLoginError").textContent="ユーザー名またはパスワードが違います。";
});
document.getElementById("adminLogout").addEventListener("click",()=>{adminLoggedIn=false;showScreen("productsScreen")});
function resetProductForm(){document.getElementById("productForm").reset();document.getElementById("editProductId").value="";document.getElementById("adminProductCategory").value="ドリンク"}
document.getElementById("productFormReset").addEventListener("click",resetProductForm);
document.getElementById("productForm").addEventListener("submit",e=>{
 e.preventDefault(); if(!adminLoggedIn)return;
 const idText=document.getElementById("editProductId").value;
 const name=document.getElementById("adminProductName").value.trim();
 const category=document.getElementById("adminProductCategory").value;
 const price=Number(document.getElementById("adminProductPrice").value);
 const stock=Number(document.getElementById("adminProductStock").value);
 if(!name||price<0||stock<0||!Number.isFinite(price)||!Number.isFinite(stock)){alert("商品情報を正しく入力してください。");return}
 if(idText){const p=products.find(x=>x.id===Number(idText));if(p)Object.assign(p,{name,category,price,stock})}
 else {const id=Math.max(0,...products.map(p=>Number(p.id)||0))+1;products.push({id,name,category,price,stock})}
 saveData();resetProductForm();renderProducts();renderAdmin();alert("商品情報を保存しました。");
});
document.getElementById("adminProductTable").addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b||!adminLoggedIn)return;const id=Number(b.dataset.editProduct||b.dataset.deleteProduct);const p=products.find(x=>x.id===id);if(!p)return;
 if(b.dataset.editProduct){document.getElementById("editProductId").value=p.id;document.getElementById("adminProductName").value=p.name;document.getElementById("adminProductCategory").value=p.category;document.getElementById("adminProductPrice").value=p.price;document.getElementById("adminProductStock").value=p.stock;document.getElementById("productForm").scrollIntoView({behavior:"smooth"})}
 if(b.dataset.deleteProduct){if(cart.some(x=>x.id===id)){alert("注文中の商品は削除できません。先に注文から削除してください。");return}if(confirm(p.name+" を商品一覧から削除しますか？")){products=products.filter(x=>x.id!==id);saveData();renderProducts();renderAdmin()}}
});
document.getElementById("salesPeriod").addEventListener("change",renderSalesAnalysis);
function periodOrders(){const v=document.getElementById("salesPeriod").value;const now=new Date();return orderHistory.filter(o=>{if(v==="all")return true;const d=new Date(o.date);if(Number.isNaN(d.getTime()))return false;if(v==="today")return d.toDateString()===now.toDateString();return (now-d)<=Number(v)*86400000 && d<=now})}
function renderAdmin(){if(!adminLoggedIn)return;
 const revenue=orderHistory.reduce((s,o)=>s+Number(o.total||0),0),units=orderHistory.reduce((s,o)=>s+(o.items||[]).reduce((a,i)=>a+Number(i.quantity||0),0),0),low=products.filter(p=>Number(p.stock)<=5).length;
 document.getElementById("adminStats").innerHTML=`<div class="stat-card"><span>累計売上</span><strong>${yen(revenue)}</strong></div><div class="stat-card"><span>注文数</span><strong>${orderHistory.length} 件</strong></div><div class="stat-card"><span>在庫少（5個以下）</span><strong>${low} 商品</strong></div>`;
 document.getElementById("adminProductTable").innerHTML=`<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>商品名</th><th>カテゴリー</th><th>価格</th><th>在庫</th><th>操作</th></tr></thead><tbody>${products.map(p=>`<tr><td>${safe(p.name)}</td><td>${safe(p.category)}</td><td>${yen(p.price)}</td><td>${p.stock}</td><td><button data-edit-product="${p.id}">編集</button><button class="delete-product" data-delete-product="${p.id}">削除</button></td></tr>`).join("")}</tbody></table></div>`;
 renderSalesAnalysis();
}
function renderSalesAnalysis(){if(!adminLoggedIn)return;const orders=periodOrders();const revenue=orders.reduce((s,o)=>s+Number(o.total||0),0);const qty=orders.reduce((s,o)=>s+(o.items||[]).reduce((a,i)=>a+Number(i.quantity||0),0),0);const method={},itemMap={},categoryMap={};
 orders.forEach(o=>{const m=o.method||"現金";method[m]=(method[m]||0)+Number(o.total||0);(o.items||[]).forEach(i=>{itemMap[i.name]=(itemMap[i.name]||0)+Number(i.quantity||0);const p=products.find(p=>p.id===i.id);const c=p?p.category:"その他";categoryMap[c]=(categoryMap[c]||0)+Number(i.quantity||0)})});
 const bars=(obj,unit="個")=>{const entries=Object.entries(obj).sort((a,b)=>b[1]-a[1]);const max=Math.max(1,...entries.map(x=>x[1]));return entries.length?entries.map(([k,v])=>`<div class="bar-row"><div class="bar-label"><span>${safe(k)}</span><strong>${unit==="円"?yen(v):v+unit}</strong></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2,v/max*100)}%"></div></div></div>`).join(""):'<p class="empty">データがありません。</p>'};
 const top=Object.entries(itemMap).sort((a,b)=>b[1]-a[1]).slice(0,5).reduce((o,[k,v])=>(o[k]=v,o),{});
 document.getElementById("salesAnalysis").innerHTML=`<div class="admin-stats"><div class="stat-card"><span>選択期間の売上</span><strong>${yen(revenue)}</strong></div><div class="stat-card"><span>注文数</span><strong>${orders.length} 件</strong></div><div class="stat-card"><span>販売数量</span><strong>${qty} 個</strong></div></div><div class="analysis-grid"><div class="analysis-card"><h4>カテゴリー別販売数量</h4>${bars(categoryMap)}</div><div class="analysis-card"><h4>売れ筋商品 TOP 5</h4>${bars(top)}</div><div class="analysis-card"><h4>支払方法別売上</h4>${bars(method,"円")}</div><div class="analysis-card"><h4>在庫が少ない商品（5個以下）</h4>${products.filter(p=>Number(p.stock)<=5).sort((a,b)=>a.stock-b.stock).map(p=>`<div class="bar-row"><div class="bar-label"><span>${safe(p.name)}</span><strong>残り ${p.stock} 個</strong></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(3,Number(p.stock)/5*100)}%"></div></div></div>`).join("")||'<p class="empty">在庫が少ない商品はありません。</p>'}</div></div>`;
}
