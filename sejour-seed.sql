INSERT INTO users (username, password, first_name, last_name, email, is_admin, phone)
VALUES ('testuser1',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test1',
        'User',
        '2@2com',
        FALSE,
        '123-345-1234'),
       ('testuser2',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test2',
        'Admin!',
        '1@1.com',
        FALSE,'123-345-1234'),
       ('testuser3',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test3',
        'Admin!',
        '3@3.com',
        TRUE,'123-345-1234');

INSERT INTO properties (title, address, description, price, owner_username)
VALUES ('syndicate 24/7 methodologies', '18 Montana Road', 'Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque. Duis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus.', 897, 'testuser1'),
('revolutionize visionary e-tailers', '83347 Dayton Lane', 'Integer ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi. Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus.', 740, 'testuser3'),
('strategize user-centric schemas', '192 Reindahl Point', 'Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero. Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum. Integer a nibh.', 647, 'testuser1'),
('engineer intuitive synergies', '8281 Corben Hill', 'Nulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi. Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque.', 295, 'testuser3'),
('transition 24/7 initiatives', '35 Schiller Road', 'Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.', 696, 'testuser1'),
('extend proactive methodologies', '4 Farragut Trail', 'Sed ante. Vivamus tortor. Duis mattis egestas metus. Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh.', 266, 'testuser3'),
('recontextualize e-business solutions', '7 Victoria Terrace', 'Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.', 658, 'testuser3'),
('monetize plug-and-play convergence', '2 Scoville Alley', 'Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius.', 575, 'testuser1'),
('evolve interactive content', '83 South Drive', 'Pellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.', 555, 'testuser3'),
('unleash value-added convergence', '57100 Straubel Hill', 'Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.', 889, 'testuser2'),
('morph cross-platform web services', '086 Carpenter Alley', 'Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.', 596, 'testuser3'),
('repurpose frictionless ROI', '2 Sunfield Street', 'Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est. Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum. Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.', 965, 'testuser1'),
('architect global functionalities', '784 Manley Place', 'Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae, Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.', 681, 'testuser3'),
('exploit innovative action-items', '1 Elmside Center', 'Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae, Mauris viverra diam vitae quam. Suspendisse potenti.', 745, 'testuser1'),
('synergize clicks-and-mortar e-business', '54 Bluestem Pass', 'Phasellus in felis. Donec semper sapien a libero. Nam dui.', 917, 'testuser2'),
('transition interactive initiatives', '86 Cordelia Junction', 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin risus. Praesent lectus. Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae, Duis faucibus accumsan odio. Curabitur convallis. Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.', 234, 'testuser2'),
('orchestrate killer synergies', '559 Jay Drive', 'In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet. Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae, Mauris viverra diam vitae quam. Suspendisse potenti.', 654, 'testuser3'),
('evolve cutting-edge supply-chains', '7 Esch Street', 'Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui.', 881, 'testuser3'),
('deploy strategic interfaces', '3 Lakeland Plaza', 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.', 884, 'testuser1'),
('enhance ubiquitous applications', '69291 La Follette Plaza', 'Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat. Curabitur gravida nisi at nibh. In hac habitasse platea dictumst. Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem. Integer tincidunt ante vel ipsum. Praesent blandit lacinia erat. Vestibulum sed magna at nunc commodo placerat.', 285, 'testuser3');


-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-billy-jo-catbagan-10493902.jpg
-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-george-desipris-1475234.jpg
-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-graphicgumcom-1115804.jpg
-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-joe-howell-3410511.jpg
-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-jonathan-borba-3255245.jpg
-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-jonathan-borba-3255246.jpg
-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-lynnelle-richardson-678109.jpg
-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-moises-arias-12162438.jpg
-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-ricardo-esquivel-1683503.jpg
-- https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-skyler-ewing-5753501.jpg

INSERT INTO images (key, property_id)
VALUES ('https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-billy-jo-catbagan-10493902.jpg', 1),
 ('https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-george-desipris-1475234.jpg', 2),
  (' https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-graphicgumcom-1115804.jpg',3),
   ('https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-joe-howell-3410511.jpg', 4),
    ('https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-jonathan-borba-3255245.jpg', 5),
     ('https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-jonathan-borba-3255246.jpg', 6),
      ('https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-lynnelle-richardson-678109.jpg', 7),
       ('https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-moises-arias-12162438.jpg', 8),
        ('https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-ricardo-esquivel-1683503.jpg', 9),
         ('https://sharebb-r.s3.us-east-2.amazonaws.com/site-images/pexels-skyler-ewing-5753501.jpg', 10);