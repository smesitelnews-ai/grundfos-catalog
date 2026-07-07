import json

data_path = 'public/products.json'
with open(data_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    name = p['name'].upper()
    specs = {}
    
    # Generic specs for all Grundfos
    specs['Производитель'] = 'Grundfos (Дания)'
    specs['Материал корпуса'] = 'Чугун' if 'ALPHA' in name or 'UP ' in name else 'Нержавеющая сталь / Композит'
    specs['Гарантия'] = '5 лет' if 'ALPHA' in name else '2 года'
    
    # Parse name for specs
    if 'ALPHA' in name or 'UP ' in name:
        specs['Тип насоса'] = 'Циркуляционный'
        if '25-' in name: specs['Диаметр подключения'] = '1" (25 мм)'
        elif '32-' in name: specs['Диаметр подключения'] = '1 1/4" (32 мм)'
        
        if '-60' in name: specs['Максимальный напор'] = '6 м'
        elif '-80' in name: specs['Максимальный напор'] = '8 м'
        elif '-45' in name: specs['Максимальный напор'] = '4.5 м'
        
        if '180' in name: specs['Монтажная длина'] = '180 мм'
        elif '150' in name: specs['Монтажная длина'] = '150 мм'
        
        p['description'] = f"Высокоэффективный циркуляционный насос {p['name']} для систем отопления. Оснащен двигателем на постоянных магнитах и функцией автоматической адаптации (AUTOADAPT). Обеспечивает минимальное энергопотребление в классе и бесшумную работу."
        
    elif 'SOLOLIFT' in name:
        specs['Тип насоса'] = 'Канализационная установка'
        specs['Максимальный напор'] = '8.5 м'
        specs['Мощность'] = '620 Вт'
        if 'WC' in name: specs['Подключение унитаза'] = 'Да'
        if 'D-2' in name: specs['Подключение унитаза'] = 'Нет (для раковины/душа)'
        p['description'] = f"Компактная автоматическая канализационная насосная установка {p['name']} со встроенным режущим механизмом. Идеально подходит для перекачивания сточных вод от сантехнических приборов, находящихся ниже уровня канализации."
        
    elif 'UNILIFT' in name:
        specs['Тип насоса'] = 'Дренажный'
        if 'CC' in name: specs['Материал корпуса'] = 'Композит'
        if 'KP' in name: specs['Материал корпуса'] = 'Нержавеющая сталь'
        specs['Макс. размер частиц'] = '10 мм'
        p['description'] = f"Погружной дренажный насос {p['name']} для перекачивания чистой и слабозагрязненной воды. Отличается высокой надежностью, встроенной тепловой защитой и поплавковым выключателем для автоматической работы."
        
    elif 'SB' in name or 'SBA' in name:
        specs['Тип насоса'] = 'Колодезный (погружной)'
        specs['Максимальный напор'] = '45 м' if '45' in name else '35 м'
        if 'AW' in name: specs['Особенность'] = 'Поплавковый выключатель и боковой забор'
        elif 'A' in name: specs['Особенность'] = 'Поплавковый выключатель'
        p['description'] = f"Погружной колодезный насос {p['name']} для бытового водоснабжения. Встроенный блок управления (в моделях SBA) избавляет от необходимости установки внешнего контроллера. Обеспечивает стабильное давление."

    p['specs'] = specs

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("Mock specs generated successfully.")
