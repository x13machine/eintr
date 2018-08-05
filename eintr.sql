-- Adminer 4.3.1 PostgreSQL dump

DROP TABLE IF EXISTS "articles";
CREATE SEQUENCE articles_dex_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."articles" (
    "hash" character varying(48) NOT NULL,
    "ID" bigint DEFAULT nextval('articles_dex_seq') NOT NULL,
    "slug" character varying(20) NOT NULL,
    "url" character varying(500) NOT NULL,
    "title" text NOT NULL,
    "published" numeric DEFAULT 0,
    "description" text NOT NULL,
    "content" text,
    "image" integer,
    "tweeted" boolean DEFAULT false NOT NULL,
    CONSTRAINT "idx_16477_id" UNIQUE ("hash"),
    CONSTRAINT "idx_16477_primary" PRIMARY KEY ("ID"),
    CONSTRAINT "idx_16477_url" UNIQUE ("url")
) WITH (oids = false);

CREATE INDEX "articles_search" ON "public"."articles" USING btree ("");


DROP TABLE IF EXISTS "sources";
CREATE TABLE "public"."sources" (
    "slug" character varying(20) NOT NULL,
    "type" character varying(10) DEFAULT news NOT NULL,
    "name" character varying(60) NOT NULL,
    "inuse" boolean DEFAULT true NOT NULL,
    "link" character varying(100) NOT NULL,
    CONSTRAINT "idx_16496_primary" PRIMARY KEY ("slug")
) WITH (oids = false);


DROP TABLE IF EXISTS "users";
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."users" (
    "ID" bigint DEFAULT nextval('users_id_seq') NOT NULL,
    "email" character varying(254) NOT NULL,
    "google" character varying(21),
    "name" character varying(60) NOT NULL,
    CONSTRAINT "idx_16503_email" UNIQUE ("email"),
    CONSTRAINT "idx_16503_primary" PRIMARY KEY ("ID")
) WITH (oids = false);


DROP TABLE IF EXISTS "votes";
CREATE SEQUENCE "votes_ID_seq1" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."votes" (
    "ID" integer DEFAULT nextval('"votes_ID_seq1"') NOT NULL,
    "article" integer NOT NULL,
    "user" integer NOT NULL,
    "vote" boolean NOT NULL,
    CONSTRAINT "votes2_ID" PRIMARY KEY ("ID"),
    CONSTRAINT "votes2_article_user" UNIQUE ("article", "user")
) WITH (oids = false);


DROP TABLE IF EXISTS "images";
CREATE SEQUENCE "images_ID_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."images" (
    "ID" integer DEFAULT nextval('"images_ID_seq"') NOT NULL,
    "url" character varying(48) NOT NULL,
    "hash" character varying(48) NOT NULL,
    "use" boolean DEFAULT true NOT NULL,
    CONSTRAINT "images_ID" PRIMARY KEY ("ID"),
    CONSTRAINT "images_hash" UNIQUE ("hash"),
    CONSTRAINT "images_url" UNIQUE ("url")
) WITH (oids = false);


-- 2018-08-03 23:12:36.996666-05
