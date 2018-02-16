'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// инициализация
VK.init({
    apiId: 6328105
});
// авторизация в контакте
function auth() {
    return new Promise(function (resolve, reject) {
        VK.Auth.login(function (data) {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
    });
}
// вызов метода
function callAPI(method, params) {
    params.v = '5.69';

    return new Promise(function (resolve, reject) {
        VK.api(method, params, function (data) {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    });
}

var list = document.querySelector('.friends-list');
var addedList = document.querySelector('.list__added');
var button = document.querySelector('.button');
var leftFilterInput = document.querySelector('.left-col__input');
var rightFilterInput = document.querySelector('.right-col__input');
var friends = {};
var addedFriendsArr = [];
// получение друзей из контакта
_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var i, len, j, lenFr;
    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.prev = 0;
                    _context.next = 3;
                    return auth();

                case 3:
                    _context.next = 5;
                    return callAPI('friends.get', { fields: 'photo_50' });

                case 5:
                    friends = _context.sent;

                    friends = friends.items;

                    if (!localStorage.getItem('friends')) {
                        showFriends(friends, 'leftCol');
                    } else {
                        addedFriendsArr = JSON.parse(localStorage.getItem('friends'));

                        for (i = 0, len = addedFriendsArr.length; i < len; i++) {
                            for (j = 0, lenFr = friends.length; j < len1; j++) {

                                if (addedFriendsArr[i].id == friends[j].id) {
                                    friends.splice(j, 1);
                                    lenFr--;
                                }
                            }
                        }
                        showFriends(friends, 'leftCol');
                        showFriends(addedFriendsArr, 'rightCol');
                    }
                    _context.next = 13;
                    break;

                case 10:
                    _context.prev = 10;
                    _context.t0 = _context['catch'](0);

                    console.error(_context.t0);

                case 13:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, undefined, [[0, 10]]);
}))();
// следим за кликом по ссылке на добавление друзей в избранные
list.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (e.target.id) {
        addToAddedList(e.target.id);
    }
});
// следим за кликом по ссылке на удаление друзей из избранных
addedList.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (e.target.id) {
        returnFromAddedList(e.target.id);
    }
});
// следим за кликом по кнопке сохранения избранных друзей
button.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (localStorage.getItem('friends')) {
        localStorage.removeItem('friends');
    }
    if (addedFriendsArr.length) {
        localStorage.setItem('friends', JSON.stringify(addedFriendsArr));
    }
});
// что-
// следим за вводом в блоке поиска по всем друзьям
leftFilterInput.addEventListener('keyup', function () {
    var inputVal = leftFilterInput.value;

    if (inputVal) {
        filterShow(friends, inputVal, list, 'leftCol');
    } else {
        list.innerHTML = '';
        showFriends(friends, 'leftCol');
    }
});
// следим за вводом в блоке поиска по избранным друзьям
rightFilterInput.addEventListener('keyup', function () {
    if (addedFriendsArr.length) {
        var inputVal = rightFilterInput.value;

        if (inputVal) {
            filterShow(addedFriendsArr, inputVal, addedList, 'rightCol');
        } else {
            addedList.innerHTML = '';
            showFriends(addedFriendsArr, 'rightCol');
        }
    }
});

var DragManager = new function () {
    /**
    * объект для хранения информации о переносе:
    * {
    *   elem - элемент, на котором была зажата мышь
    *   id - цифровое id друга
    *   avatar - аватар
    *   downX/downY - координаты, на которых был mousedown
    *   shiftX/shiftY - относительный сдвиг курсора от угла элемента
    *   parent - родитель элемента
    * }
     */
    var dragObject = {};
    var self = this;
    // действие при нажатии на левую кнопку мыши
    document.addEventListener('mousedown', function (e) {
        var elem = e.target.closest('.draggable');
        var id = elem.id;

        if (e.which != 1) return;

        if (!elem) return;

        //записываем инфо об элементе в объект
        dragObject.elem = elem;
        dragObject.id = id.slice(3);
        dragObject.parent = elem.closest('.droppable');
        dragObject.downX = e.pageX;
        dragObject.downY = e.pageY;

        return false;
    });
    // действие при перемещении мыши с зажатой кнопкой
    document.addEventListener('mousemove', function (e) {
        if (!dragObject.elem) return;

        if (!dragObject.avatar) {
            dragObject.avatar = createAvatar(e);
            if (!dragObject.avatar) {
                dragObject = {};
                return;
            }
            var coords = getCoords(dragObject.avatar);

            dragObject.shiftX = dragObject.downX - coords.left;
            dragObject.shiftY = dragObject.downY - coords.top;

            startDrag(e);
        }
        // отобразить перенос объекта при каждом движении мыши
        dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
        dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';

        return false;
    });
    // действие при отпускании левой кнопки мыши
    document.addEventListener('mouseup', function (e) {
        if (dragObject.avatar) {
            finishDrag(e);
        }
        dragObject = {};
    });
    // окончание перетаскивания
    function finishDrag(e) {
        var dropElem = findDroppable(e);

        if (!dropElem) {
            self.onDragCancel(dragObject);
        } else {
            if (dropElem == dragObject.parent) {
                self.onDragCancel(dragObject);
            } else {
                self.onDragEnd(dragObject, dropElem);
            }
        }
    }
    // создание аватара из элемента
    function createAvatar(e) {
        // запомнить старые свойства, чтобы вернуться к ним при отмене переноса
        var avatar = dragObject.elem;
        var old = {
            parent: avatar.parentNode,
            nextSibling: avatar.nextSibling,
            position: avatar.position || '',
            left: avatar.left || '',
            top: avatar.top || '',
            zIndex: avatar.zIndex || '',
            fontSize: avatar.fontSize || ''
        };

        // функция для отмены переноса
        avatar.rollback = function () {
            old.parent.insertBefore(avatar, old.nextSibling);
            avatar.style.position = old.position;
            avatar.style.left = old.left;
            avatar.style.top = old.top;
            avatar.style.zIndex = old.zIndex;
            avatar.style.fontSize = old.fontSize;
        };

        return avatar;
    }
    // начало переноса
    function startDrag(e) {
        var avatar = dragObject.avatar;

        // инициировать начало переноса
        document.body.appendChild(avatar);
        avatar.style.zIndex = 9999;
        avatar.style.position = 'absolute';
        avatar.style.width = '280px';
        avatar.style.fontFamily = 'fira_sansmedium, sans-serif';
        avatar.style.fontSize = '0.75em';
        avatar.style.fontWeight = 'bold';
    }
    // поиск элемента с классом droppable под курсором мыши
    function findDroppable(event) {
        // спрячем переносимый элемент
        dragObject.avatar.hidden = true;

        // получить самый вложенный элемент под курсором мыши
        var elem = document.elementFromPoint(event.clientX, event.clientY);

        // показать переносимый элемент обратно
        dragObject.avatar.hidden = false;

        if (elem == null) {
            return null;
        }

        return elem.closest('.droppable');
    }
    // окончание переноса в зависимости от начального нахождения элемента
    this.onDragEnd = function (dragObject, dropElem) {
        if (dropElem == addedList) {
            addToAddedList(dragObject.id);
        }
        if (dropElem == list) {
            returnFromAddedList(dragObject.id);
        }
        document.body.removeChild(dragObject.avatar);
        dragObject = {};
    };
    // возврат элемента в начальное состояние при отмене перетаскивания
    this.onDragCancel = function (dragObject) {
        dragObject.avatar.rollback();
    };
}();
// добавление друзей в колонку для избранных
function addToAddedList(id) {
    friends = friends.filter(function (el) {

        if (el.id != id) {
            return true;
        }
        addedFriendsArr.push(el);

        return false;
    });

    list.innerHTML = '';
    addedList.innerHTML = '';

    if (leftFilterInput.value) {
        filterShow(friends, leftFilterInput.value, list, 'leftCol');
        showFriends(addedFriendsArr, 'rightCol');
    }
    if (rightFilterInput.value) {
        showFriends(friends, 'leftCol');
        filterShow(addedFriendsArr, rightFilterInput.value, addedList, 'rightCol');
    }
    if (leftFilterInput.value && rightFilterInput.value) {
        filterShow(friends, leftFilterInput.value, list, 'leftCol');
        filterShow(addedFriendsArr, rightFilterInput.value, addedList, 'rightCol');
    }
    if (!leftFilterInput.value && !rightFilterInput.value) {
        showFriends(friends, 'leftCol');
        showFriends(addedFriendsArr, 'rightCol');
    }
}
// возврат друзей в начальную колонку из колонки для избранных
function returnFromAddedList(id) {
    addedFriendsArr = addedFriendsArr.filter(function (el) {

        if (el.id != id) {
            return true;
        }
        friends.push(el);

        return false;
    });

    list.innerHTML = '';
    addedList.innerHTML = '';

    if (rightFilterInput.value) {
        showFriends(friends, 'leftCol');
        filterShow(addedFriendsArr, rightFilterInput.value, addedList, 'rightCol');
    }
    if (leftFilterInput.value) {
        filterShow(friends, leftFilterInput.value, list, 'leftCol');
        showFriends(addedFriendsArr, 'rightCol');
    }
    if (leftFilterInput.value && rightFilterInput.value) {
        filterShow(friends, leftFilterInput.value, list, 'leftCol');
        filterShow(addedFriendsArr, rightFilterInput.value, addedList, 'rightCol');
    }
    if (!leftFilterInput.value && !rightFilterInput.value) {
        showFriends(friends, 'leftCol');
        showFriends(addedFriendsArr, 'rightCol');
    }
}
//поиск подстроки и вывод найденных друзей
function filterShow(array, inputValue, elem, indexCol) {
    var resultArr = [];

    if (inputValue) {
        array.forEach(function (el) {
            var fullName = el.first_name + ' ' + el.last_name;

            if (isMatching(fullName, inputValue)) resultArr.push(el);
        });
        if (resultArr.length) {
            elem.innerHTML = '';
            showFriends(resultArr, indexCol);
        } else {
            elem.innerHTML = '';
        }
    }
}
// сравнение подстроки со строкой
function isMatching(full, chunk) {
    chunk = chunk.toLowerCase();
    full = full.toLowerCase();

    if (full.indexOf(chunk) == -1) {
        return false;
    }

    return true;
}
// вывод друзей в браузер
function showFriends(friends, key) {
    for (var i = 0, len = friends.length; i < len; i++) {
        var li = document.createElement('li'),
            divImg = document.createElement('div'),
            img = document.createElement('img'),
            divName = document.createElement('div'),
            a = document.createElement('a');

        li.id = 'li-' + friends[i].id;
        divImg.className = 'img-wr';
        img.className = 'img';
        divName.className = 'name';

        if (key === 'leftCol') {
            li.className = 'list__item list__item_add draggable';
            a.className = 'link add-link';

            list.appendChild(li);
        }
        if (key === 'rightCol') {
            li.className = 'list__item list__item_remove draggable';
            a.className = 'link remove-link';

            addedList.appendChild(li);
        }
        img.src = '' + friends[i].photo_50;
        divName.textContent = friends[i].first_name + ' ' + friends[i].last_name;
        a.id = '' + friends[i].id;

        divImg.appendChild(img);
        li.appendChild(divImg);
        li.appendChild(divName);
        li.appendChild(a);
    }
}
function getCoords(elem) {
    // кроме IE8-
    var box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
}