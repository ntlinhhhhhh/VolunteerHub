export interface ICacheService {
    /**
     * Lấy dữ liệu từ cache
     * @param key Redis key
     */
    get(key: string): Promise<string | null>;

    /**
     * Lưu dữ liệu vào cache
     * @param key Redis key
     * @param value stringified JSON
     * @param ttl TTL tính bằng giây
     */
    set(key: string, value: string, ttl?: number): Promise<void>;

    /**
     * Xoá cache theo key
     */
    del(key: string): Promise<void>;
}
