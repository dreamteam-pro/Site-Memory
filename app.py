import streamlit as st
from google import genai
from PIL import Image
import json
import urllib.request, urllib.parse, hashlib, re, html
from google.genai import types
import io
from pathlib import Path

st.set_page_config(page_title='SITE MEMORY | 4WARD',page_icon='🏛️',layout='wide')
st.markdown('''<style>
.block-container{max-width:1250px;padding-top:2rem;padding-bottom:4rem}
h1,h2,h3{color:#542934;letter-spacing:-.035em}
.sm-hero{position:relative;overflow:hidden;isolation:isolate;background:#F1D6CE;color:#542934;border:1px solid #CEACA6;border-radius:22px;padding:clamp(22px,5vw,64px);margin-bottom:26px;min-height:340px}
.sm-kicker,.sm-footer{font-size:12px;letter-spacing:.17em;font-weight:600}.sm-footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid #B57C88;padding-top:16px;margin-top:32px}
.sm-title{font-size:clamp(48px,10vw,122px);font-weight:850;line-height:.88;letter-spacing:-.085em;margin:35px 0 20px;animation:sm-rise .85s ease both}.sm-title span{display:block;color:#542934}.sm-sub{max-width:460px;font-size:16px;line-height:1.6;animation:sm-rise 1.1s ease both}
.sm-art{position:absolute;right:0;top:0;width:48%;height:100%;z-index:-1;opacity:.72;animation:sm-rise 1.5s ease both}.sm-scan{animation:sm-sweep 6s ease-in-out infinite alternate}.sm-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px}.sm-step{border:1px solid #CEACA6;border-radius:14px;padding:18px;background:#F1D6CE;transition:transform .25s,background .25s}.sm-step:hover{transform:translateY(-4px);background:#CEACA6}.sm-step b{display:block;font-size:20px;color:#542934}.sm-step small{color:#542934}
[data-testid="stTabs"] [role="tab"]{font-weight:600;padding:12px 14px;transition:background .2s,color .2s;border-radius:10px 10px 0 0;color:#542934}[data-testid="stTabs"] [role="tab"]:hover{background:#F1D6CE}[data-testid="stTabs"] [role="tab"][aria-selected="true"]{background:#542934;color:#fff}[data-testid="stTabs"] [data-baseweb="tab-highlight"]{background:#B57C88}
[data-testid="stButton"] button{border-radius:10px;transition:transform .2s,background .2s;min-height:44px}[data-testid="stButton"] button:not(:disabled):hover{transform:translateY(-2px);background:#542934;color:white;border-color:#542934}[data-testid="stFileUploaderDropzone"]{background:#F1D6CE;border:1px dashed #B57C88;border-radius:14px;padding:20px}[data-testid="stImage"] img{border-radius:12px}
@keyframes sm-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes sm-sweep{from{transform:translateY(0)}to{transform:translateY(230px)}}@media(max-width:650px){.sm-art{opacity:.23;width:75%}.sm-steps{grid-template-columns:1fr}.sm-hero{min-height:0}}@media(prefers-reduced-motion:reduce){.sm-title,.sm-sub,.sm-art,.sm-scan{animation:none}.sm-step,[data-testid="stButton"] button{transition:none}}
</style>
<section class="sm-hero"><div class="sm-kicker">4WARD / ARCHITECTURE × AI / ALMATY</div><svg class="sm-art" viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#B57C88" stroke-width="1.2"><path d="M20 310L180 35 365 110 365 310Z M180 35V310 M20 310L365 110 M180 35L310 310"/><path d="M60 310L190 75 330 130V310 M100 310L200 115 295 150V310 M140 310L210 155 260 170V310"/><path d="M0 310H400 M0 270H400 M0 230H400 M0 190H400 M0 150H400 M0 110H400 M0 70H400" opacity=".4"/><circle cx="180" cy="35" r="7" fill="#542934"/><circle cx="365" cy="110" r="5" fill="#542934"/></g><path class="sm-scan" d="M0 45H400" stroke="#542934" stroke-width="2" opacity=".65"/></svg><div class="sm-title">SITE<span>MEMORY.</span></div><div class="sm-sub">Discover the past. Reimagine the future.<br>Исследуйте архитектуру города и создавайте новые возможности вместе с ИИ.</div><div class="sm-footer"><span>EST. 2026 / 4WARD</span><span>PAST · PRESENT · FUTURE ↓</span></div></section>
<div class="sm-steps"><div class="sm-step"><small>01 / PAST</small><b>Remember.</b><small>История места</small></div><div class="sm-step"><small>02 / PRESENT</small><b>Understand.</b><small>Архитектурный анализ</small></div><div class="sm-step"><small>03 / FUTURE</small><b>Reimagine.</b><small>Концепции обновления</small></div></div>''', unsafe_allow_html=True)
data=json.loads(Path(__file__).with_name('buildings.json').read_text(encoding='utf-8'))
PROMPT='''Ты архитектурный ассистент SITE MEMORY. Проанализируй фото: предполагаемый стиль, видимые материалы, пропорции, характерные элементы (Site DNA). Отделяй наблюдения от предположений. Используй только предоставленные исторические сведения, не выдумывай факты или источники. Предложи три концепции обновления: историческая, современная, экологичная. Укажи, что требуется проверка архитектором. Отвечай на русском.'''

def ask(prompt,image,*other_images):
    try:
        key=st.secrets['GEMINI_API_KEY']
        client=genai.Client(api_key=key)
        result=client.models.generate_content(model='gemini-3.1-flash-lite',contents=[prompt,image,*other_images])
        return result.text or 'Модель не вернула текст.'
    except Exception as e:
        st.error('Запрос не выполнен. Проверьте секрет GEMINI_API_KEY, доступность модели и лимиты API. Тип ошибки: '+type(e).__name__)
        return None

scan,memory,redesign,world,community=st.tabs(['Scan & Identify','Memory View','AI Design Studio','World Architecture','Community Hub'])
with scan:
    st.header('01 / Исследуйте здание')
    location=st.text_input('Название или адрес здания (необязательно)', value='')
    mode=st.radio('Источник фото',['Загрузить файл','Камера'],horizontal=True)
    photo=st.file_uploader('Фото здания',type=['jpg','jpeg','png']) if mode=='Загрузить файл' else st.camera_input('Сфотографируйте здание')
    image=None
    if photo:
        try:
            image=Image.open(photo).convert('RGB'); image.thumbnail((1600,1600)); st.image(image,width=550)
        except Exception: st.error('Не удалось открыть фотографию.')
    signature=hashlib.sha256((photo.getvalue() if photo else b'')+location.encode()).hexdigest()
    if st.session_state.get('signature')!=signature:
        for k in ['analysis','identity','found','design','render','comparison','search_query']:
            st.session_state.pop(k,None)
        st.session_state['signature']=signature
    if st.button('Анализировать с Gemini',disabled=image is None):
        with st.spinner('ИИ распознаёт здание…'):
            result=ask('Определи вероятное название здания по фото. Подсказка пользователя: '+location+'. Верни только JSON с полями name, query (английское название здания и город для поиска Wikimedia), confidence (high, medium или low). Если не уверен, не выдумывай название, оставь name и query пустыми или используй явно указанное пользователем название с low.',image)
            try:
                identity=json.loads(re.sub(r'^```(?:json)?\s*|\s*```$','',result.strip()))
                if not isinstance(identity,dict): raise ValueError()
            except Exception: identity={'name':location,'query':location,'confidence':'low'}
            st.session_state.identity=identity
            st.session_state.analysis=ask(PROMPT+'\nПредполагаемый объект: '+str(identity.get('name',''))+'; подсказка: '+location,image)
    identity=st.session_state.get('identity',{})
    if identity:
        st.info('Предполагаемый объект: '+str(identity.get('name') or 'Не определён')+' · Уверенность модели: '+str(identity.get('confidence','low')))
        st.caption('Это предположение ИИ, а не подтверждённая идентификация.')
    if st.session_state.get('analysis'): st.markdown(st.session_state.analysis)

@st.cache_data(ttl=3600,show_spinner=False)
def commons_search(query):
    params={'action':'query','generator':'search','gsrsearch':query,'gsrnamespace':6,'gsrlimit':18,'prop':'imageinfo','iiprop':'url|extmetadata|mime','iiurlwidth':700,'format':'json'}
    req=urllib.request.Request('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params),headers={'User-Agent':'SiteMemory4WARD/1.0 (student architecture prototype; Wikimedia image search)'})
    with urllib.request.urlopen(req,timeout=20) as response: payload=json.load(response)
    results=[]
    for page in payload.get('query',{}).get('pages',{}).values():
        info=page.get('imageinfo',[{}])[0]; meta=info.get('extmetadata',{})
        def field(k): return html.unescape(re.sub('<[^>]+>','',meta.get(k,{}).get('value','')))[:1200]
        if info.get('mime') not in ('image/jpeg','image/png','image/webp'): continue
        results.append({'title':page['title'],'url':info.get('thumburl',info.get('url')),'source':info.get('descriptionurl'),'date':field('DateTimeOriginal'),'description':field('ImageDescription'),'author':field('Artist'),'license':field('LicenseShortName'),'license_url':field('LicenseUrl')})
    return results

def fetch_photo(url):
    if urllib.parse.urlparse(url).hostname!='upload.wikimedia.org': raise ValueError('Неподдерживаемый источник')
    req=urllib.request.Request(url,headers={'User-Agent':'SiteMemory4WARD/1.0 (student architecture prototype)'})
    with urllib.request.urlopen(req,timeout=20) as response: raw=response.read(10_000_001)
    if len(raw)>10_000_000: raise ValueError('Фото слишком большое')
    im=Image.open(io.BytesIO(raw)).convert('RGB'); im.thumbnail((1200,1200)); return im

with memory:
    st.header('02 / Memory View')
    st.write('Автоматический поиск исторических материалов в Wikimedia Commons.')
    query=st.text_input('Название для поиска (можно уточнить)',value=str(identity.get('query') or location),key='search_query')
    if st.button('Найти фотографии прошлого',disabled=not query.strip()):
        with st.spinner('Поиск в интернет-архиве…'):
            st.session_state.pop('comparison',None)
            try:
                candidates={}
                for suffix in [' historical',' Soviet','']:
                    for item in commons_search(query+suffix): candidates[item['title']]=item
                items=list(candidates.values())
                # Ask AI to rank metadata, never invent URLs or dates.
                if items and image:
                    ranking=ask('Выбери до 6 наиболее вероятных исторических снимков именно этого здания по метаданным. Не считай дату загрузки датой съёмки. Если архивность не ясна, не утверждай её. Верни только JSON массив индексов, начиная с 0. Объект: '+query+'\n'+json.dumps([{k:v for k,v in x.items() if k in ('title','date','description')} for x in items],ensure_ascii=False),image)
                    try:
                        indices=json.loads(re.sub(r'^```(?:json)?\s*|\s*```$','',ranking.strip()))
                        ordered=[items[i] for i in indices if type(i)==int and 0<=i<len(items)]
                        items=list({x['title']:x for x in ordered+items}.values())
                    except Exception: pass
                st.session_state.found=(query,items[:12])
            except Exception as e:
                st.session_state.pop('found',None); st.error('Поиск недоступен: '+type(e).__name__+'. Попробуйте позже.')
    found=st.session_state.get('found')
    if found and found[0]==query:
        items=found[1]
        if not items: st.warning('Фотографии не найдены. Уточните название здания.')
        else:
            st.caption('Найденные кандидаты. Архивность и совпадение объекта не подтверждены автоматически.')
            idx=st.selectbox('Выберите найденный снимок',range(len(items)),format_func=lambda i:items[i]['title'].replace('File:',''))
            item=items[idx]; left,right=st.columns(2)
            with left:
                st.markdown('### PAST / Найденный снимок')
                st.image(item['url'],use_container_width=True)
                st.write('Дата по метаданным: '+(item['date'] or 'не указана'))
                st.caption('Автор: '+(item['author'] or 'см. источник')+' | Лицензия: '+(item['license'] or 'см. источник'))
                if item['source']: st.link_button('Оригинал и условия использования',item['source'])
                if item['license_url']: st.markdown('[Условия лицензии]('+item['license_url']+')')
            with right:
                st.markdown('### PRESENT / Настоящее')
                if image: st.image(image,use_container_width=True)
                else: st.info('Загрузите современное фото в Scan.')
            if st.button('Сравнить фотографии с ИИ',disabled=image is None):
                try:
                    with st.spinner('Сравнение…'):
                        old=fetch_photo(item['url'])
                        result=ask('Сравни первое найденное фото и второе фото пользователя. Сначала оцени совпадение здания. Если не совпадает, предупреди. Дата первого фото по метаданным: '+item['date']+'. Не утверждай архивность без доказательств. Опиши видимые изменения и ограничения сравнения.',old,image)
                        st.session_state.comparison=(item['title'],result)
                except Exception as e: st.error('Не удалось получить снимок: '+type(e).__name__)
            comp=st.session_state.get('comparison')
            if comp and comp[0]==item['title'] and comp[1]: st.markdown(comp[1])
    st.caption('Поиск охватывает Wikimedia Commons, а не весь интернет. Для некоторых зданий архивных снимков может не быть.')
with redesign:
    st.header('03 / AI Design Studio')
    if image: st.image(image,width=450)
    else: st.info('Загрузите фото в Scan & Identify.')
    style=st.radio('Направление',['Историческое сохранение','Современное обновление','Экологичное благоустройство','Своя идея'])
    changes=st.multiselect('Что изменить?',['Фасад','Материалы','Цветовая гамма','Озеленение','Освещение','Общественное пространство','Сохранить исторические элементы'])
    wishes=st.text_area('Опишите свои пожелания')
    design_prompt=PROMPT+'\nСоздай одну концепцию: '+style+'. Изменения: '+', '.join(changes)+'. Пожелания: '+wishes+'. Сохрани узнаваемость здания. Опиши конкретные изменения.'
    if st.button('Создать концепцию с ИИ',disabled=image is None):
        with st.spinner('Разработка концепции…'): st.session_state.design=ask(design_prompt,image)
    if st.session_state.get('design'): st.markdown(st.session_state.design)
    st.caption('Текстовая концепция доступна через текущую модель Gemini. Визуализация требует отдельной модели.')
    enable=st.checkbox('Попробовать генерацию изображения (только если доступна модель и устраивают её тарифы)')
    if enable:
        model=st.text_input('Название доступной модели изображений',value='gemini-2.5-flash-image')
        st.warning('Запрос может требовать платного тарифа. Не включайте биллинг ради теста без согласия команды.')
        if st.button('Сгенерировать визуализацию',disabled=image is None or not model.strip()):
            try:
                with st.spinner('Генерация изображения…'):
                    client=genai.Client(api_key=st.secrets['GEMINI_API_KEY'])
                    response=client.models.generate_content(model=model,contents=[image,'Создай фотореалистичную архитектурную визуализацию этого же здания. Сохрани ракурс и узнаваемость. '+design_prompt],config=types.GenerateContentConfig(response_modalities=['TEXT','IMAGE']))
                    renders=[part.inline_data.data for candidate in (response.candidates or []) for part in (candidate.content.parts if candidate.content else []) if part.inline_data and (part.inline_data.mime_type or '').startswith('image/')]
                    if renders: st.session_state.render=renders[0]
                    else: st.warning('Модель не вернула изображение.')
            except Exception as e: st.error('Генерация недоступна: '+type(e).__name__+'. Проверьте доступ к модели и тариф.')
    if st.session_state.get('render'):
        st.image(st.session_state.render,caption='ИИ-концепция, не реальный проект',use_container_width=True)
        st.download_button('Скачать визуализацию',st.session_state.render,'site-memory-design.png')
with world:
    st.header('04 / World Architecture')
    for name,url in [('Эйфелева башня','https://en.wikipedia.org/wiki/Eiffel_Tower'),('Колизей','https://en.wikipedia.org/wiki/Colosseum'),('Сиднейский оперный театр','https://en.wikipedia.org/wiki/Sydney_Opera_House')]: st.markdown(f'**{name}** — [история объекта]({url})')
with community:
    st.header('05 / Community Hub')
    st.caption('Демонстрационный черновик: идеи видны только в текущей сессии, не публикуются для других пользователей.')
    title=st.text_input('Название идеи'); idea=st.text_area('Описание идеи',value=st.session_state.get('design') or '')
    if st.button('Сохранить черновик'):
        if title.strip() and idea.strip(): st.session_state.setdefault('ideas',[]).append((title,idea))
        else: st.warning('Заполните название и описание.')
    for t,d in st.session_state.get('ideas',[]): st.subheader(t); st.write(d)
    st.caption('Подбор экспертов и общая база публикаций — дальнейшее развитие.')
