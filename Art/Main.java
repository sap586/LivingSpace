public class Main {
    public static void main(String[] args) {
        System.out.println("----ૐ----");

        int tot = 0;
        for (int i=1; i<=20; i++) {
            int j = 18000 + (i*2000);
            tot = tot + j;
            System.out.println(i + ". " + j);
        }
        System.out.println(tot);
        System.out.println("---------");

        int newTot = 0;
        for (int i=1; i<=5; i++) {
            int j = 18000 + (i*2000);
            newTot = newTot + j;
            System.out.println(i + ". " + j);
        }
        System.out.println(newThot);
        System.out.println("---------");
    }
}