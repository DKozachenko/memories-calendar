# memories-calendar

Нативное приложение для просмотра фотографий и видео, сгруппированных по дням. Предоставляет отображение по месяцам в виде календаря. Медиа контент отображается в виде галереи в модальном окне.

### Стек

* [Angular 17](https://angular.dev/)
* [Taiga UI](https://taiga-ui.dev/)
* [Tauri](https://tauri.app/)
* [Oxlint](https://oxc-project.github.io/docs/guide/usage/linter.html)
* [Commitizen](https://github.com/commitizen/cz-cli)

### Структура папок

Для корректной работы приложения необходимо упорядочить фото и видео в следующем порядке:

```
<DIRECTORY>/
├─ <YEAR>/
│  ├─ <DATE>/
│  │  ├─ image.png
│  │  ├─ image.jpg
|  |  ├─ image.jpeg
│  ├─ <DATE>/
├─ <YEAR>/
│  ├─ <DATE>/
│  │  ├─ video.mp4
│  │  ├─ video.mov
```
где
* **DIRECTORY** - директория
* **YEAR** - папка с номером года, например, "2024"
* **DATE** - папка с датой события в формате *DD.MM*, например, "21.03"

Поддерживаемые расширения изображений: *png*, *jpg*, *jpeg*.
Поддерживаемые расширения видео: *mp4*, *mov*.

### Команды

| Command                       | Description                                  |
|-------------------------------|----------------------------------------------|
| (p)npm run start:web          | Serve web application                        |
| (p)npm run build:web          | Build web application                        |
| (p)npm run lint:web           | Lint web application                         |
| (p)npm run start:native       | Serve native application                     |
| (p)npm run build:native       | Build native setup application               |
| (p)npm run lint:native        | Lint native application                      |
| (p)npm run generate:types[^1] | Generate types from Rust structs to TS types |

[^1]: Должна быть вызвана, если необходимо сгенерировать типы (в папку `bindings`) или их обновить 