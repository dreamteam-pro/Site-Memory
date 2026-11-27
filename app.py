import streamlit as st
from google import genai
from PIL import Image, ImageEnhance
import json
from pathlib import Path

st.set_page_config(page_title='SITE MEMORY | 4WARD',page_icon='🏛️',layout='wide')
st.markdown('''<style>.stApp{background:#142326;color:#e9eee8} h1,h2,h3{color:#c5dfbd!important} [data-testid="stSidebar"]{background:#203438} </style>''',unsafe_allow_html=True)
st.title('SITE MEMORY')
st.caption('4WARD / PAST · PRESENT · FUTURE / ALMATY')
data=json.loads(Path(__file__).with_name('buildings.json').read_text(encoding='utf-8'))
PROMPT='''Ты архитектурный ассистент SITE MEMORY. Проанализируй фото: предполагаемый стиль, видимые материалы, пропорции, характерные элементы (Site DNA). Отделяй наблюдения от предположений. Используй только предоставленные исторические сведения, не выдумывай факты или источники. Предложи три концепции обновления: историческая, современная, экологичная. Укажи, что требуется проверка архитектором. Отвечай на русском.'''

def ask(prompt,image):
    try:
        key=st.secrets['GEMINI_API_KEY']
        client=genai.Client(api_key=key)
        result=client.models.generate_content(model='gemini-3.1-flash-lite',contents=[prompt,image])
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
    if context:
        st.subheader(selected); st.write(context['description']); st.link_button('Открыть справочный источник',context['source']); st.link_button('Найти фотографии в Wikimedia Commons',context['photos']); st.caption('Исторические фото необходимо выбрать и проверить вручную; автоматического сопоставления пока нет.')
        if image: st.image(image,width=450,caption='Современное фото пользователя')
    else: st.info('Выберите объект во вкладке Scan & Identify.')
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
