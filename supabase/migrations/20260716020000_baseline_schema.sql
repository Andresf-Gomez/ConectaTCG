


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_sets_for_language_and_year"("lang" "text", "yr" integer) RETURNS TABLE("id" bigint, "set_code" "text", "names" "jsonb")
    LANGUAGE "sql" STABLE
    AS $$
  SELECT DISTINCT ON (s.id) s.id, s.set_code, s.names
  FROM catalog_cards cc
  JOIN sets s ON s.id = cc.set_id
  WHERE cc.languages @> jsonb_build_array(lang)
    AND s.year = yr
    AND s.game_id = 6
  ORDER BY s.id, s.names->>'en';
$$;


ALTER FUNCTION "public"."get_sets_for_language_and_year"("lang" "text", "yr" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_years_for_language"("lang" "text") RETURNS TABLE("year" integer)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT DISTINCT s.year
  FROM sets s
  JOIN catalog_cards cc ON cc.set_id = s.id
  WHERE cc.languages @> to_jsonb(lang)
    AND s.year IS NOT NULL
  ORDER BY s.year DESC;
$$;


ALTER FUNCTION "public"."get_years_for_language"("lang" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cards" (
    "id" bigint NOT NULL,
    "seller_id" "uuid",
    "name" "text" NOT NULL,
    "set_name" "text",
    "number" "text",
    "rarity" "text",
    "type" "text",
    "language" "text",
    "condition" "text",
    "price" integer NOT NULL,
    "image_url" "text",
    "description" "text",
    "shipping" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "city" "text",
    "image" "text",
    "seller_name" "text",
    "rating" numeric DEFAULT 5.0,
    "reviews" integer DEFAULT 0,
    "sales" integer DEFAULT 0,
    "year" integer,
    "variant" "text"
);


ALTER TABLE "public"."cards" OWNER TO "postgres";


ALTER TABLE "public"."cards" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cards_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."catalog_card_variants" (
    "catalog_card_id" bigint NOT NULL,
    "language" "text" NOT NULL,
    "variant_id" bigint NOT NULL
);


ALTER TABLE "public"."catalog_card_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."catalog_cards" (
    "id" bigint NOT NULL,
    "set_id" bigint,
    "rarity_id" bigint,
    "tcgdex_id" "text" NOT NULL,
    "names" "jsonb" DEFAULT '{}'::"jsonb",
    "number" "text",
    "image_url" "text",
    "languages" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."catalog_cards" OWNER TO "postgres";


ALTER TABLE "public"."catalog_cards" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."catalog_cards_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" bigint NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."games" OWNER TO "postgres";


ALTER TABLE "public"."games" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."games_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" bigint NOT NULL,
    "seller_id" "uuid",
    "catalog_card_id" bigint,
    "language" "text" NOT NULL,
    "variant" "text",
    "condition" "text" NOT NULL,
    "price" integer NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "description" "text",
    "city" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


ALTER TABLE "public"."listings" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."listings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "city" "text",
    "phone" "text",
    "rating" numeric DEFAULT 5.0,
    "total_sales" integer DEFAULT 0,
    "verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "role" "text" DEFAULT 'buyer'::"text",
    "email" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rarities" (
    "id" bigint NOT NULL,
    "game_id" bigint,
    "code" "text" NOT NULL,
    "names" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."rarities" OWNER TO "postgres";


ALTER TABLE "public"."rarities" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."rarities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."seller_requests" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "reason" "text",
    "reviewed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."seller_requests" OWNER TO "postgres";


ALTER TABLE "public"."seller_requests" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."seller_requests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."sets" (
    "id" bigint NOT NULL,
    "game_id" bigint,
    "set_code" "text" NOT NULL,
    "names" "jsonb" DEFAULT '{}'::"jsonb",
    "serie" "text",
    "year" integer,
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."sets" OWNER TO "postgres";


ALTER TABLE "public"."sets" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."sets_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" bigint NOT NULL,
    "buyer_id" "uuid",
    "seller_id" "uuid",
    "card_id" bigint,
    "amount" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "shipping_code" "text",
    "payout_method" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


ALTER TABLE "public"."transactions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."transactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."variants" (
    "id" bigint NOT NULL,
    "game_id" bigint,
    "code" "text" NOT NULL,
    "names" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."variants" OWNER TO "postgres";


ALTER TABLE "public"."variants" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."variants_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."cards"
    ADD CONSTRAINT "cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."catalog_card_variants"
    ADD CONSTRAINT "catalog_card_variants_pkey" PRIMARY KEY ("catalog_card_id", "language", "variant_id");



ALTER TABLE ONLY "public"."catalog_cards"
    ADD CONSTRAINT "catalog_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."catalog_cards"
    ADD CONSTRAINT "catalog_cards_tcgdex_id_key" UNIQUE ("tcgdex_id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rarities"
    ADD CONSTRAINT "rarities_game_id_code_key" UNIQUE ("game_id", "code");



ALTER TABLE ONLY "public"."rarities"
    ADD CONSTRAINT "rarities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seller_requests"
    ADD CONSTRAINT "seller_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sets"
    ADD CONSTRAINT "sets_game_id_set_code_key" UNIQUE ("game_id", "set_code");



ALTER TABLE ONLY "public"."sets"
    ADD CONSTRAINT "sets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."variants"
    ADD CONSTRAINT "variants_game_id_code_key" UNIQUE ("game_id", "code");



ALTER TABLE ONLY "public"."variants"
    ADD CONSTRAINT "variants_pkey" PRIMARY KEY ("id");



CREATE INDEX "catalog_card_variants_catalog_card_id_language_idx" ON "public"."catalog_card_variants" USING "btree" ("catalog_card_id", "language");



CREATE INDEX "catalog_card_variants_variant_id_idx" ON "public"."catalog_card_variants" USING "btree" ("variant_id");



CREATE INDEX "idx_catalog_set" ON "public"."catalog_cards" USING "btree" ("set_id");



CREATE INDEX "idx_catalog_tcgdex" ON "public"."catalog_cards" USING "btree" ("tcgdex_id");



CREATE INDEX "idx_listings_catalog" ON "public"."listings" USING "btree" ("catalog_card_id");



CREATE INDEX "idx_listings_seller" ON "public"."listings" USING "btree" ("seller_id");



CREATE INDEX "idx_listings_status" ON "public"."listings" USING "btree" ("status");



CREATE INDEX "idx_rarities_game" ON "public"."rarities" USING "btree" ("game_id");



CREATE INDEX "idx_sets_game" ON "public"."sets" USING "btree" ("game_id");



ALTER TABLE ONLY "public"."cards"
    ADD CONSTRAINT "cards_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."catalog_card_variants"
    ADD CONSTRAINT "catalog_card_variants_catalog_card_id_fkey" FOREIGN KEY ("catalog_card_id") REFERENCES "public"."catalog_cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."catalog_card_variants"
    ADD CONSTRAINT "catalog_card_variants_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."catalog_cards"
    ADD CONSTRAINT "catalog_cards_rarity_id_fkey" FOREIGN KEY ("rarity_id") REFERENCES "public"."rarities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."catalog_cards"
    ADD CONSTRAINT "catalog_cards_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_catalog_card_id_fkey" FOREIGN KEY ("catalog_card_id") REFERENCES "public"."catalog_cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rarities"
    ADD CONSTRAINT "rarities_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."seller_requests"
    ADD CONSTRAINT "seller_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."seller_requests"
    ADD CONSTRAINT "seller_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sets"
    ADD CONSTRAINT "sets_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."variants"
    ADD CONSTRAINT "variants_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



CREATE POLICY "Cartas públicas" ON "public"."cards" FOR SELECT USING (true);



CREATE POLICY "Comprador crea transacción" ON "public"."transactions" FOR INSERT WITH CHECK (("auth"."uid"() = "buyer_id"));



CREATE POLICY "Comprador ve sus transacciones" ON "public"."transactions" FOR SELECT USING ((("auth"."uid"() = "buyer_id") OR ("auth"."uid"() = "seller_id")));



CREATE POLICY "Partes actualizan transacción" ON "public"."transactions" FOR UPDATE USING ((("auth"."uid"() = "buyer_id") OR ("auth"."uid"() = "seller_id")));



CREATE POLICY "Perfiles públicos" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Usuario crea su perfil" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Usuario edita su perfil" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Vendedor edita sus cartas" ON "public"."cards" FOR UPDATE USING (("auth"."uid"() = "seller_id"));



CREATE POLICY "Vendedor publica cartas" ON "public"."cards" FOR INSERT WITH CHECK (("auth"."uid"() = "seller_id"));



CREATE POLICY "admin_update" ON "public"."seller_requests" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "admin_write" ON "public"."catalog_card_variants" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."cards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "catalog_admin_write" ON "public"."catalog_cards" USING ("public"."is_admin"());



ALTER TABLE "public"."catalog_card_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."catalog_cards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "catalog_public_read" ON "public"."catalog_cards" FOR SELECT USING (true);



ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "games_admin_write" ON "public"."games" USING ("public"."is_admin"());



CREATE POLICY "games_public_read" ON "public"."games" FOR SELECT USING (true);



ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "listings_public_read" ON "public"."listings" FOR SELECT USING (true);



CREATE POLICY "listings_seller_delete" ON "public"."listings" FOR DELETE USING (("auth"."uid"() = "seller_id"));



CREATE POLICY "listings_seller_insert" ON "public"."listings" FOR INSERT WITH CHECK (("auth"."uid"() = "seller_id"));



CREATE POLICY "listings_seller_update" ON "public"."listings" FOR UPDATE USING (("auth"."uid"() = "seller_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_read" ON "public"."catalog_card_variants" FOR SELECT USING (true);



ALTER TABLE "public"."rarities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rarities_admin_write" ON "public"."rarities" USING ("public"."is_admin"());



CREATE POLICY "rarities_public_read" ON "public"."rarities" FOR SELECT USING (true);



ALTER TABLE "public"."seller_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sets_admin_write" ON "public"."sets" USING ("public"."is_admin"());



CREATE POLICY "sets_public_read" ON "public"."sets" FOR SELECT USING (true);



ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_insert_own" ON "public"."seller_requests" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "user_select_own" ON "public"."seller_requests" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "user_select_own_profile" ON "public"."profiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "user_update_own_profile" ON "public"."profiles" FOR UPDATE USING ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."variants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "variants_admin_write" ON "public"."variants" USING ("public"."is_admin"());



CREATE POLICY "variants_public_read" ON "public"."variants" FOR SELECT USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_sets_for_language_and_year"("lang" "text", "yr" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_sets_for_language_and_year"("lang" "text", "yr" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sets_for_language_and_year"("lang" "text", "yr" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_years_for_language"("lang" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_years_for_language"("lang" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_years_for_language"("lang" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";


















GRANT ALL ON TABLE "public"."cards" TO "anon";
GRANT ALL ON TABLE "public"."cards" TO "authenticated";
GRANT ALL ON TABLE "public"."cards" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cards_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cards_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cards_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."catalog_card_variants" TO "anon";
GRANT ALL ON TABLE "public"."catalog_card_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."catalog_card_variants" TO "service_role";



GRANT ALL ON TABLE "public"."catalog_cards" TO "anon";
GRANT ALL ON TABLE "public"."catalog_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."catalog_cards" TO "service_role";



GRANT ALL ON SEQUENCE "public"."catalog_cards_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."catalog_cards_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."catalog_cards_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";



GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."listings" TO "anon";
GRANT ALL ON TABLE "public"."listings" TO "authenticated";
GRANT ALL ON TABLE "public"."listings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."listings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."listings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."listings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."rarities" TO "anon";
GRANT ALL ON TABLE "public"."rarities" TO "authenticated";
GRANT ALL ON TABLE "public"."rarities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rarities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rarities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rarities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."seller_requests" TO "anon";
GRANT ALL ON TABLE "public"."seller_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_requests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."seller_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."seller_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."seller_requests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sets" TO "anon";
GRANT ALL ON TABLE "public"."sets" TO "authenticated";
GRANT ALL ON TABLE "public"."sets" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sets_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sets_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sets_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."transactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."variants" TO "anon";
GRANT ALL ON TABLE "public"."variants" TO "authenticated";
GRANT ALL ON TABLE "public"."variants" TO "service_role";



GRANT ALL ON SEQUENCE "public"."variants_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."variants_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."variants_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































