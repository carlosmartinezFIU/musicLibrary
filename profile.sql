CREATE TABLE profiles(
    profile_id BIGSERIAL PRIMARY KEY NOT NULL,
    profile_email VARCHAR(100),
    profile_password VARCHAR(100),
    profile_image VARCHAR(200)
);

CREATE TABLE track(
    track_id BIGSERIAL PRIMARY KEY NOT NULL,
    track_name VARCHAR(150) NOT NULL,
    track_duration INT NOT NULL,
    track_artist VARCHAR(150) NOT NULL,
    track_number INT NOT NULL,
    track_spotify_id VARCHAR(50) NOT NULL,
    profile_id INT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) 
);

CREATE TABLE album(
    album_id BIGSERIAL PRIMARY KEY NOT NULL,
    album_image VARCHAR(100) NOT NULL,
    album_name VARCHAR(150) NOT NULL,
    album_release_date VARCHAR(25) NOT NULL,
    album_spotify_id VARCHAR(80) NOT NULL,
    album_artist VARCHAR(150) NOT NULL,
    profile_id INT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) 
);


CREATE TABLE session(
    sid CHARACTER VARYING PRIMARY KEY NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);
