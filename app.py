import streamlit as st
from google import genai
from PIL import Image, ImageEnhance
import json
from pathlib import Path

st.set_page_config(page_title='SITE MEMORY | 4WARD',page_icon='🏛️',layout='wide')
st.markdown("""<style>
.block-container {max-width: 1150px; padding-top: 3rem; padding-bottom: 3rem;}
h1,h2,h3 {letter-spacing: -0.025em; color: #542934;}
[data-testid="stTabs"] [role="tab"][aria-selected="true"] {color: #542934; background: #F1D6CE; border-radius: 8px 8px 0 0;}
[data-testid="stTabs"] [data-baseweb="tab-highlight"] {background-color: #B57C88;}
[data-testid="stButton"] button:not(:disabled):hover {background: #F1D6CE; color: #542934; border-color: #B57C88;}
[data-testid="stFileUploaderDropzone"] {background: #F1D6CE;}
[data-testid="stTabs"] [role="tab"] {font-weight: 600;}
[data-testid="stFileUploaderDropzone"] {border: 1px dashed #CEACA6; border-radius: 12px;}
</style>""", unsafe_allow_html=True)
st.title('SITE MEMORY')
st.caption('4WARD / PAST · PRESENT · FUTURE / ALMATY')
st.markdown('### Discover the past. Reimagine the future.')
st.write('Исследуйте архитектуру города, её историю и возможности обновления вместе с ИИ.')
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

scan,memory,transform,redesign,world,community=st.tabs(['Scan & Identify','Memory View','Transform Studio','AI Redesign','World Architecture','Community Hub'])
with scan:
    st.header('01 / Исследуйте здание')
    location=st.text_input('Название или адрес здания')
    selected=st.selectbox('Объект для исторического сравнения (укажите вручную)', ['Не выбран']+list(data))
    photo=st.file_uploader('Загрузите фото здания (без личных данных)',type=['jpg','jpeg','png'])
    image=None
    if photo:
        try:
            image=Image.open(photo).convert('RGB'); image.thumbnail((1600,1600)); st.image(image,width=550)
        except Exception: st.error('Не удалось открыть фотографию.')
    context=data.get(selected,{})
    if st.button('Анализировать с Gemini',disabled=image is None):
        with st.spinner('ИИ анализирует фотографию…'):
            st.session_state['analysis']=ask(PROMPT+'\nМесто со слов пользователя: '+location+'\nСведения о выбранном вручную объекте: '+json.dumps(context,ensure_ascii=False),image)
    if st.session_state.get('analysis'): st.markdown(st.session_state.analysis)
with memory:
    st.header('02 / Memory View')
    st.write('У каждого места есть своя история. Сравните прошлое и настоящее.')
    names=list(data)
    memory_name=st.selectbox('Исторический объект',names,index=names.index(selected) if selected in names else 0,key='memory_object')
    record=data[memory_name]
    st.subheader(memory_name)
    st.write(record['description'])
    st.link_button('История объекта',record['source'])
    st.link_button('Найти архивное фото',record['photos'])
    old_file=st.file_uploader('Архивная фотография',type=['jpg','jpeg','png'],key='memory_old')
    old_date=st.text_input('Год или период архивного снимка (если известен)')
    old_source=st.text_input('Источник архивного фото (ссылка или название архива)')
    new_file=st.file_uploader('Современное фото (необязательно, если уже загружено в Scan)',type=['jpg','jpeg','png'],key='memory_new')
    def read_memory_photo(file):
        if file is None: return None
        try:
            im=Image.open(file).convert('RGB'); im.thumbnail((1600,1600)); return im
        except Exception:
            st.error('Не удалось открыть фото.'); return None
    old_image=read_memory_photo(old_file)
    new_image=read_memory_photo(new_file) if new_file else image
    left,right=st.columns(2)
    with left:
        st.markdown('### PAST / Прошлое')
        if old_image: st.image(old_image,caption=old_date or 'Дата не указана',use_container_width=True)
        else: st.info('Загрузите архивную фотографию.')
        if old_source: st.caption('Источник: '+old_source)
    with right:
        st.markdown('### PRESENT / Настоящее')
        if new_image: st.image(new_image,caption='Современное фото пользователя',use_container_width=True)
        else: st.info('Загрузите современную фотографию.')
    confirmed=st.checkbox('Я проверил(а), что обе фотографии относятся к выбранному объекту')
    import hashlib
    signature=hashlib.sha256(repr((memory_name,old_date,old_source)).encode()+(old_image.tobytes() if old_image else b'')+(new_image.tobytes() if new_image else b'')).hexdigest()
    if st.button('Сравнить с помощью ИИ',disabled=not (old_image and new_image and confirmed)):
        with st.spinner('ИИ сравнивает фотографии…'):
            result=ask('Ты архитектурный ассистент. Первое фото архивное, второе современное. Объект со слов пользователя: '+memory_name+'. Период: '+old_date+'. Источник со слов пользователя: '+old_source+'. Сравни видимые элементы фасада, материалы, окружение и изменения. Отдели наблюдения от предположений. Учитывай ракурс, освещение и качество фото. Не выдумывай даты, причины изменений и исторические факты. Если объекты не совпадают, предупреди. Ответ на русском.',old_image,new_image)
            st.session_state['memory_result']=(signature,result)
    saved=st.session_state.get('memory_result')
    if confirmed and saved and saved[0]==signature and saved[1]: st.markdown(saved[1])
    st.caption('Архивные материалы выбираются вручную. ИИ сравнивает видимые признаки, но не подтверждает подлинность снимков. Используйте фотографии с разрешением на использование.')
with transform:
    st.header('03 / Transform Studio')
    st.caption('Базовое редактирование фотографии, без ИИ.')
    if image:
        brightness=st.slider('Яркость',0.5,1.5,1.0); color=st.slider('Насыщенность',0.0,2.0,1.0)
        a,b=st.columns(2); a.image(image,caption='До'); b.image(ImageEnhance.Color(ImageEnhance.Brightness(image).enhance(brightness)).enhance(color),caption='После')
    else: st.info('Сначала загрузите фото.')
with redesign:
    st.header('04 / AI Redesign')
    style=st.radio('Направление',['Историческое сохранение','Современное обновление','Экологичное благоустройство'])
    wishes=st.text_area('Ваши пожелания')
    if st.button('Создать концепцию',disabled=image is None):
        with st.spinner('Генерация концепции…'):
            st.session_state['design']=ask(PROMPT+'\nРазработай подробно одну концепцию: '+style+'\nПожелания: '+wishes+'\nИсторические сведения: '+json.dumps(context,ensure_ascii=False)+'\nДай конкретные изменения и промпт для будущей визуализации.',image)
    if st.session_state.get('design'): st.markdown(st.session_state.design)
    st.caption('Текстовая ИИ-концепция. Генерация новых изображений пока не подключена.')
with world:
    st.header('05 / World Architecture')
    for name,url in [('Эйфелева башня','https://en.wikipedia.org/wiki/Eiffel_Tower'),('Колизей','https://en.wikipedia.org/wiki/Colosseum'),('Сиднейский оперный театр','https://en.wikipedia.org/wiki/Sydney_Opera_House')]: st.markdown(f'**{name}** — [история объекта]({url})')
with community:
    st.header('06 / Community Hub')
    st.caption('Демонстрационный черновик: идеи видны только в текущей сессии, не публикуются для других пользователей.')
    title=st.text_input('Название идеи'); idea=st.text_area('Описание идеи',value=st.session_state.get('design') or '')
    if st.button('Сохранить черновик'):
        if title.strip() and idea.strip(): st.session_state.setdefault('ideas',[]).append((title,idea))
        else: st.warning('Заполните название и описание.')
    for t,d in st.session_state.get('ideas',[]): st.subheader(t); st.write(d)
    st.caption('Подбор экспертов и общая база публикаций — дальнейшее развитие.')
