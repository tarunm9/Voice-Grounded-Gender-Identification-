import mysql.connector


def Connection():
    host = "localhost"
    user = "root"
    passwd = ""
    db = "final_project"
    conn = ""
    conn = mysql.connector.connect(host=host, user=user, passwd=passwd)
    cursor = conn.cursor()
    cursor.execute("show databases")
    if ('final_project',) in cursor:
        print("Database exists")
        con = mysql.connector.connect(
            host=host, user=user, passwd=passwd, db=db)
        cur = con.cursor()
        print("Connected")
        print("Executing table info")
        cur.execute("show tables")
        print("executed")
        if ('audio_info',) in cur:
            print("table Exists")
            print("Connection Established")
        else:
            print("creating table")
            cur.execute("create table audio_info(id int primary key auto_increment, audio_name varchar(500), audio_size varchar(100),audio_type varchar(100),audio_url varchar(2000))")
            print("Table created")
            print("Connection Established")

        return con
    else:
        cursor.execute("create database final_project")
        print("database created")
        con = mysql.connector.connect(
            host=host, user=user, passwd=passwd, db=db)
        print("Database connected")
        cur = con.cursor()
        print("creating table")
        cur.execute("create table audio_info(id int primary key auto_increment, audio_name varchar(500),audio_size varchar(100),audio_type varchar(100),audio_url varchar(2000))")
        print("Table created")
        print("Connection Established")
        return con
