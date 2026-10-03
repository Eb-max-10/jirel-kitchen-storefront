"""
M1 Challenger Adversarial Stress Test Oracle
Executes empirical negative tests against an active SQL database engine (SQLite)
to verify that all table constraints, foreign keys, unique indexes, and checks
actively PREVENT invalid data insertions.
"""

import sqlite3
import json
import re
import sys

def main():
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    print("============================================================")
    print("   M1 ADVERSARIAL SQL ENGINE STRESS TEST ORACLE (SQLITE)    ")
    print("============================================================\n")

    # Define schema adapted for SQLite to simulate PostgreSQL constraints
    cursor.executescript("""
    CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        image_url TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0)
    );

    CREATE TABLE products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
        sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
        is_featured BOOLEAN NOT NULL DEFAULT 0,
        is_best_seller BOOLEAN NOT NULL DEFAULT 0,
        rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5.00),
        rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
        specs TEXT NOT NULL DEFAULT '{}',
        CONSTRAINT chk_sale_price_le_base CHECK (sale_price IS NULL OR sale_price <= base_price)
    );

    CREATE TABLE product_variants (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        color_hex TEXT NOT NULL CHECK (length(color_hex) = 7 AND color_hex LIKE '#%'),
        sku TEXT UNIQUE,
        price NUMERIC(12, 2) CHECK (price IS NULL OR price >= 0),
        stock_quantity INTEGER NOT NULL DEFAULT 50 CHECK (stock_quantity >= 0),
        display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0)
    );

    CREATE TABLE product_images (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
        url TEXT NOT NULL CHECK (url LIKE 'http://%' OR url LIKE 'https://%'),
        alt TEXT NOT NULL,
        is_primary BOOLEAN NOT NULL DEFAULT 0,
        display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0)
    );

    CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        order_number TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL CHECK (length(trim(customer_name)) > 0),
        email TEXT NOT NULL CHECK (length(trim(email)) > 0),
        customer_phone TEXT NOT NULL CHECK (length(trim(customer_phone)) >= 7),
        shipping_address TEXT NOT NULL CHECK (length(trim(shipping_address)) > 0),
        items TEXT NOT NULL CHECK (json_valid(items) = 1 AND json_array_length(items) > 0),
        subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
        delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
        total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
        currency TEXT NOT NULL DEFAULT 'NGN',
        paystack_reference TEXT UNIQUE,
        payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
        paid_at TEXT,
        metadata TEXT NOT NULL DEFAULT '{}'
    );
    """)

    passed = 0
    failed = 0

    def expect_fail(name, query, params=(), expected_err_type="IntegrityError"):
        nonlocal passed, failed
        try:
            cursor.execute(query, params)
            conn.commit()
            failed += 1
            print(f"  [FAIL - ADVERSARIAL INSERT SUCCEEDED UNEXPECTEDLY] {name}")
        except sqlite3.IntegrityError as e:
            passed += 1
            print(f"  [PASS - CORRECTLY BLOCKED BY CONSTRAINT] {name}: {e}")
        except Exception as e:
            passed += 1
            print(f"  [PASS - BLOCKED] {name}: {type(e).__name__}: {e}")

    def expect_pass(name, query, params=()):
        nonlocal passed, failed
        try:
            cursor.execute(query, params)
            conn.commit()
            passed += 1
            print(f"  [PASS - VALID INSERT] {name}")
        except Exception as e:
            failed += 1
            print(f"  [FAIL - VALID INSERT REJECTED] {name}: {e}")

    print("--> 1. Valid Baseline Insertion Test")
    expect_pass("Insert Category 'pots-pans'",
                "INSERT INTO categories (id, name, slug, image_url, display_order) VALUES (?, ?, ?, ?, ?)",
                ('pots-pans', 'Pots & Pans', 'pots-pans', 'https://example.com/img.jpg', 1))

    expect_pass("Insert Product 'prod-1'",
                """INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price, is_featured, is_best_seller, rating, rating_count, specs)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                ('prod-1', 'The Always Pan', 'the-always-pan', 'Desc', 'pots-pans', 45000.00, 38000.00, 1, 1, 4.9, 142, '{"Material": "Ceramic"}'))

    expect_pass("Insert Variant 'var-1-1'",
                """INSERT INTO product_variants (id, product_id, name, color_hex, sku, price, stock_quantity, display_order)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                ('var-1-1', 'prod-1', 'Sage', '#87907D', 'JK-PAN-SAGE', 38000.00, 50, 1))

    expect_pass("Insert Image 'img-1-1'",
                """INSERT INTO product_images (id, product_id, variant_id, url, alt, is_primary, display_order)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                ('img-1-1', 'prod-1', 'var-1-1', 'https://images.unsplash.com/p1.jpg', 'Always pan alt', 1, 1))

    print("\n--> 2. Relational Foreign Key Attacks")
    expect_fail("Product referencing non-existent category",
                """INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price)
                   VALUES ('prod-bad-cat', 'Bad Product', 'bad-product', 'Desc', 'non-existent-cat', 1000, NULL)""")

    expect_fail("Variant referencing non-existent product",
                """INSERT INTO product_variants (id, product_id, name, color_hex, sku, price, stock_quantity)
                   VALUES ('var-bad-prod', 'non-existent-prod', 'Ghost', '#112233', 'SKU-GHOST', 1000, 10)""")

    expect_fail("Image referencing non-existent product",
                """INSERT INTO product_images (id, product_id, variant_id, url, alt)
                   VALUES ('img-bad-prod', 'non-existent-prod', NULL, 'https://example.com/i.jpg', 'Ghost')""")

    expect_fail("Image referencing non-existent variant",
                """INSERT INTO product_images (id, product_id, variant_id, url, alt)
                   VALUES ('img-bad-var', 'prod-1', 'non-existent-var', 'https://example.com/i.jpg', 'Ghost')""")

    print("\n--> 3. Product Constraint Attacks")
    expect_fail("Product with sale_price > base_price",
                """INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price)
                   VALUES ('prod-bad-sale', 'Overpriced Sale', 'bad-sale', 'Desc', 'pots-pans', 10000.00, 15000.00)""")

    expect_fail("Product with negative base_price",
                """INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price)
                   VALUES ('prod-neg-base', 'Negative Base', 'neg-base', 'Desc', 'pots-pans', -500.00, NULL)""")

    expect_fail("Product with rating > 5.0",
                """INSERT INTO products (id, name, slug, description, category_id, base_price, sale_price, rating)
                   VALUES ('prod-super-star', 'Super Star', 'super-star', 'Desc', 'pots-pans', 5000.00, NULL, 5.5)""")

    expect_fail("Product with duplicate slug",
                """INSERT INTO products (id, name, slug, description, category_id, base_price)
                   VALUES ('prod-dup-slug', 'Duplicate Slug', 'the-always-pan', 'Desc', 'pots-pans', 5000.00)""")

    print("\n--> 4. Variant Constraint Attacks")
    expect_fail("Variant with invalid color_hex (not starting with #)",
                """INSERT INTO product_variants (id, product_id, name, color_hex, sku)
                   VALUES ('var-bad-hex1', 'prod-1', 'Bad Hex', '87907D', 'SKU-BAD-1')""")

    expect_fail("Variant with invalid color_hex (too long)",
                """INSERT INTO product_variants (id, product_id, name, color_hex, sku)
                   VALUES ('var-bad-hex2', 'prod-1', 'Bad Hex', '#87907DFF', 'SKU-BAD-2')""")

    expect_fail("Variant with duplicate SKU",
                """INSERT INTO product_variants (id, product_id, name, color_hex, sku)
                   VALUES ('var-dup-sku', 'prod-1', 'Dup SKU', '#112233', 'JK-PAN-SAGE')""")

    print("\n--> 5. Image Constraint Attacks")
    expect_fail("Image with invalid url (ftp://)",
                """INSERT INTO product_images (id, product_id, variant_id, url, alt)
                   VALUES ('img-ftp', 'prod-1', 'var-1-1', 'ftp://example.com/pic.png', 'FTP Alt')""")

    expect_fail("Image with invalid url (file://)",
                """INSERT INTO product_images (id, product_id, variant_id, url, alt)
                   VALUES ('img-file', 'prod-1', 'var-1-1', 'file:///c:/secret.png', 'File Alt')""")

    print("\n--> 6. Order Constraint Attacks")
    valid_items = json.dumps([{"productId": "prod-1", "name": "Always Pan", "price": 38000, "quantity": 1}])
    
    expect_pass("Insert Valid Order",
                """INSERT INTO orders (id, order_number, customer_name, email, customer_phone, shipping_address, items, total_price, paystack_reference, payment_status)
                   VALUES ('ord-1', 'JK-001001', 'Amaka Eze', 'amaka@example.com', '+2348012345678', '12 Victoria Island Lagos', ?, 38000.00, 'ref_test_001', 'pending')""",
                (valid_items,))

    expect_fail("Order with invalid payment_status ('fraudulent')",
                """INSERT INTO orders (id, order_number, customer_name, email, customer_phone, shipping_address, items, total_price, paystack_reference, payment_status)
                   VALUES ('ord-bad-status', 'JK-001002', 'John', 'j@e.com', '+2348012345678', 'Addr', ?, 1000, 'ref_test_002', 'fraudulent')""",
                (valid_items,))

    expect_fail("Order with empty customer_phone",
                """INSERT INTO orders (id, order_number, customer_name, email, customer_phone, shipping_address, items, total_price, paystack_reference)
                   VALUES ('ord-empty-phone', 'JK-001003', 'John', 'j@e.com', '', 'Addr', ?, 1000, 'ref_test_003')""",
                (valid_items,))

    expect_fail("Order with phone shorter than 7 chars ('12345')",
                """INSERT INTO orders (id, order_number, customer_name, email, customer_phone, shipping_address, items, total_price, paystack_reference)
                   VALUES ('ord-short-phone', 'JK-001004', 'John', 'j@e.com', '12345', 'Addr', ?, 1000, 'ref_test_004')""",
                (valid_items,))

    expect_fail("Order with empty customer_name (whitespace)",
                """INSERT INTO orders (id, order_number, customer_name, email, customer_phone, shipping_address, items, total_price, paystack_reference)
                   VALUES ('ord-blank-name', 'JK-001005', '   ', 'j@e.com', '+2348012345678', 'Addr', ?, 1000, 'ref_test_005')""",
                (valid_items,))

    expect_fail("Order with negative total_price (-100)",
                """INSERT INTO orders (id, order_number, customer_name, email, customer_phone, shipping_address, items, total_price, paystack_reference)
                   VALUES ('ord-neg-price', 'JK-001006', 'John', 'j@e.com', '+2348012345678', 'Addr', ?, -100.00, 'ref_test_006')""",
                (valid_items,))

    expect_fail("Order with empty items array '[]'",
                """INSERT INTO orders (id, order_number, customer_name, email, customer_phone, shipping_address, items, total_price, paystack_reference)
                   VALUES ('ord-empty-items', 'JK-001007', 'John', 'j@e.com', '+2348012345678', 'Addr', '[]', 1000, 'ref_test_007')""")

    expect_fail("Order with non-array items object '{\"item\": 1}'",
                """INSERT INTO orders (id, order_number, customer_name, email, customer_phone, shipping_address, items, total_price, paystack_reference)
                   VALUES ('ord-obj-items', 'JK-001008', 'John', 'j@e.com', '+2348012345678', 'Addr', '{"item": 1}', 1000, 'ref_test_008')""")

    expect_fail("Order with duplicate paystack_reference ('ref_test_001')",
                """INSERT INTO orders (id, order_number, customer_name, email, customer_phone, shipping_address, items, total_price, paystack_reference)
                   VALUES ('ord-dup-ref', 'JK-001009', 'John', 'j@e.com', '+2348012345678', 'Addr', ?, 1000, 'ref_test_001')""",
                (valid_items,))

    print("\n============================================================")
    print(f"   ADVERSARIAL STRESS TEST SUMMARY                          ")
    print(f"   Passed: {passed} | Failed: {failed}                     ")
    print("============================================================")

    if failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
